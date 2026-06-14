import { GameState, Player, Tile, DiceRoll, CardDeck } from "./types";
import { BOARD_TILES } from "./board";
import { CHANCE_CARDS, COMMUNITY_CARDS, shuffleCards } from "./cards";

export function rollDice(): DiceRoll {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return { d1, d2, isDouble: d1 === d2 };
}

export function createInitialState(playerNames: string[], playerColors: string[]): GameState {
  const players: Player[] = playerNames.map((name, i) => ({
    id: i,
    name,
    color: ["red", "blue", "green", "yellow"][i] as any,
    money: 1500,
    position: 0,
    inJail: false,
    jailTurns: 0,
    getOutOfJailCards: 0,
    properties: [],
    bankrupt: false,
    isActive: true,
  }));

  const tiles: Tile[] = BOARD_TILES.map(t => ({ ...t }));

  return {
    players,
    tiles,
    currentPlayerIndex: 0,
    phase: "rolling",
    dice: [1, 1],
    lastRoll: null,
    doublesCount: 0,
    message: `Giliran ${players[0].name}! Lempar dadu.`,
    winner: null,
    chanceCards: shuffleCards(CHANCE_CARDS),
    communityCards: shuffleCards(COMMUNITY_CARDS),
    currentCard: null,
    pendingRent: null,
    log: [`Permainan dimulai! ${playerNames.join(", ")} siap bermain.`],
  };
}

export function getCurrentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

export function movePlayer(state: GameState, steps: number): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const oldPosition = player.position;
  player.position = (player.position + steps) % 40;

  if (player.position < oldPosition && steps > 0) {
    player.money += 200;
    newState.log.push(`${player.name} melewati GO! Dapat M200`);
  }

  return newState;
}

export function handleLanding(state: GameState): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const tile = newState.tiles[player.position];

  newState.currentCard = null;

  switch (tile.type) {
    case "go":
      newState.phase = "rolling";
      newState.message = `${player.name} mendarat di GO!`;
      newState.log.push(`${player.name} mendarat di GO!`);
      return advanceTurn(newState);

    case "jail":
      newState.phase = "rolling";
      newState.message = `${player.name} hanya berkunjung ke Penjara.`;
      return advanceTurn(newState);

    case "free-parking":
      newState.phase = "rolling";
      newState.message = `${player.name} parkir gratis!`;
      newState.log.push(`${player.name} parkir gratis!`);
      return advanceTurn(newState);

    case "go-to-jail":
      player.position = 10;
      player.inJail = true;
      player.jailTurns = 0;
      newState.phase = "jail";
      newState.message = `${player.name} masuk PENJARA!`;
      newState.log.push(`${player.name} dikirim ke penjara!`);
      return newState;

    case "income-tax":
      newState.phase = "income-tax";
      newState.message = `${player.name} kena Pajak Penghasilan: bayar M${tile.taxAmount}`;
      return newState;

    case "luxury-tax":
      newState.phase = "luxury-tax";
      newState.message = `${player.name} kena Pajak Kemewahan: bayar M${tile.taxAmount}`;
      return newState;

    case "chance":
      return drawCard(newState, "chance");

    case "community-chest":
      return drawCard(newState, "community-chest");

    case "property":
    case "railroad":
    case "utility":
      if (tile.ownerId === null || tile.ownerId === undefined) {
        newState.phase = "buying";
        newState.message = `${player.name} mendarat di ${tile.name} (M${tile.price}). Beli?`;
      } else if (tile.ownerId === player.id) {
        newState.phase = "rolling";
        newState.message = `${player.name} mendarat di properti sendiri.`;
        return advanceTurn(newState);
      } else if (tile.mortgaged) {
        newState.phase = "rolling";
        newState.message = `${tile.name} sedang dijaminkan, tidak ada sewa.`;
        return advanceTurn(newState);
      } else {
        const rent = calculateRent(newState, tile, player);
        const owner = newState.players.find(p => p.id === tile.ownerId)!;
        newState.phase = "paying-rent";
        newState.pendingRent = { amount: rent, ownerId: owner.id };
        newState.message = `${player.name} harus bayar sewa M${rent} ke ${owner.name}!`;
        newState.log.push(`${player.name} bayar sewa M${rent} ke ${owner.name} di ${tile.name}`);
      }
      return newState;

    default:
      return advanceTurn(newState);
  }
}

function calculateRent(state: GameState, tile: Tile, _payer: Player): number {
  if (tile.type === "railroad") {
    const ownedRailroads = state.tiles.filter(
      t => t.type === "railroad" && t.ownerId === tile.ownerId
    ).length;
    return tile.railroadRent![ownedRailroads - 1];
  }

  if (tile.type === "utility") {
    const ownedUtils = state.tiles.filter(
      t => t.type === "utility" && t.ownerId === tile.ownerId
    ).length;
    const diceTotal = state.dice[0] + state.dice[1];
    return tile.utilityMultiplier![ownedUtils - 1] * diceTotal;
  }

  // Property
  if (tile.hotel) return tile.rent![5];
  if (tile.houses > 0) return tile.rent![tile.houses];

  // Check if owner has all tiles in group (monopoly)
  const groupTiles = state.tiles.filter(t => t.group === tile.group && t.type === "property");
  const allOwned = groupTiles.every(t => t.ownerId === tile.ownerId);
  if (allOwned) return tile.rent![0] * 2;

  return tile.rent![0];
}

function drawCard(state: GameState, type: "chance" | "community-chest"): GameState {
  const newState = deepClone(state);
  const deck = type === "chance" ? newState.chanceCards : newState.communityCards;
  const card = deck.shift()!;
  deck.push(card);
  newState.currentCard = card;
  newState.phase = type === "chance" ? "chance" : "community-chest";
  newState.message = `${getCurrentPlayer(newState).name} menarik kartu: "${card.text}"`;
  newState.log.push(`${getCurrentPlayer(newState).name}: ${card.text}`);
  return newState;
}

export function applyCard(state: GameState): GameState {
  if (!state.currentCard) return state;
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const card = newState.currentCard!;
  const action = card.action;

  switch (action.type) {
    case "move": {
      const target = action.to;
      if (target < player.position) {
        player.money += 200;
        newState.log.push(`${player.name} melewati GO! Dapat M200`);
      }
      player.position = target;
      newState.currentCard = null;
      return handleLanding(newState);
    }
    case "move-relative": {
      player.position = (player.position + action.amount + 40) % 40;
      newState.currentCard = null;
      return handleLanding(newState);
    }
    case "money": {
      player.money += action.amount;
      newState.currentCard = null;
      newState.phase = "rolling";
      return advanceTurn(newState);
    }
    case "money-per-player": {
      const others = newState.players.filter(p => p.id !== player.id && !p.bankrupt);
      if (action.amount > 0) {
        // receive from others
        others.forEach(p => {
          p.money -= action.amount;
          player.money += action.amount;
        });
      } else {
        // pay others
        others.forEach(p => {
          player.money += action.amount;
          p.money -= action.amount;
        });
      }
      newState.currentCard = null;
      newState.phase = "rolling";
      return advanceTurn(newState);
    }
    case "get-out-of-jail": {
      player.getOutOfJailCards++;
      newState.currentCard = null;
      newState.phase = "rolling";
      return advanceTurn(newState);
    }
    case "go-to-jail": {
      player.position = 10;
      player.inJail = true;
      player.jailTurns = 0;
      newState.currentCard = null;
      newState.phase = "jail";
      newState.message = `${player.name} masuk PENJARA!`;
      return newState;
    }
    case "repairs": {
      const totalHouses = player.properties.reduce((sum, pid) => {
        const t = newState.tiles[pid];
        return sum + (t.hotel ? 0 : t.houses);
      }, 0);
      const totalHotels = player.properties.reduce((sum, pid) => {
        const t = newState.tiles[pid];
        return sum + (t.hotel ? 1 : 0);
      }, 0);
      const cost = totalHouses * action.house + totalHotels * action.hotel;
      player.money -= cost;
      newState.log.push(`${player.name} bayar perbaikan M${cost}`);
      newState.currentCard = null;
      newState.phase = "rolling";
      return advanceTurn(newState);
    }
    case "move-to-nearest-railroad": {
      const railroads = [5, 15, 25, 35];
      const nearest = railroads.reduce((prev, curr) =>
        Math.abs(curr - player.position) < Math.abs(prev - player.position) ? curr : prev
      );
      if (nearest < player.position) {
        player.money += 200;
      }
      player.position = nearest;
      newState.currentCard = null;
      return handleLanding(newState);
    }
    case "move-to-nearest-utility": {
      const utilities = [12, 28];
      const nearest = utilities.reduce((prev, curr) =>
        Math.abs(curr - player.position) < Math.abs(prev - player.position) ? curr : prev
      );
      if (nearest < player.position) {
        player.money += 200;
      }
      player.position = nearest;
      newState.currentCard = null;
      return handleLanding(newState);
    }
    default:
      newState.currentCard = null;
      return advanceTurn(newState);
  }
}

export function buyProperty(state: GameState): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const tile = newState.tiles[player.position];

  if (player.money < (tile.price ?? 0)) {
    newState.message = "Uang tidak cukup!";
    newState.phase = "rolling";
    return advanceTurn(newState);
  }

  player.money -= tile.price ?? 0;
  tile.ownerId = player.id;
  player.properties.push(tile.id);
  newState.log.push(`${player.name} membeli ${tile.name} seharga M${tile.price}`);
  newState.phase = "rolling";
  newState.message = `${player.name} membeli ${tile.name}!`;
  return advanceTurn(newState);
}

export function skipBuying(state: GameState): GameState {
  const newState = deepClone(state);
  newState.phase = "rolling";
  newState.message = `${getCurrentPlayer(newState).name} melewati pembelian.`;
  return advanceTurn(newState);
}

export function payRent(state: GameState): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const { amount, ownerId } = newState.pendingRent!;
  const owner = newState.players.find(p => p.id === ownerId)!;

  const actualPay = Math.min(player.money, amount);
  player.money -= actualPay;
  owner.money += actualPay;
  newState.pendingRent = null;
  newState.phase = "rolling";

  if (player.money <= 0) {
    player.bankrupt = true;
    player.money = 0;
    newState.log.push(`${player.name} BANGKRUT!`);
    newState.message = `${player.name} bangkrut!`;
    player.properties.forEach(pid => {
      newState.tiles[pid].ownerId = null;
      newState.tiles[pid].houses = 0;
      newState.tiles[pid].hotel = false;
    });
    player.properties = [];
  }

  return checkWinner(advanceTurn(newState));
}

export function payTax(state: GameState): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const tile = newState.tiles[player.position];
  player.money -= tile.taxAmount ?? 0;
  newState.log.push(`${player.name} bayar pajak M${tile.taxAmount}`);
  newState.phase = "rolling";
  return advanceTurn(newState);
}

export function releaseFromJail(state: GameState, method: "card" | "pay" | "roll"): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];

  if (method === "card" && player.getOutOfJailCards > 0) {
    player.getOutOfJailCards--;
    player.inJail = false;
    player.jailTurns = 0;
    newState.message = `${player.name} bebas dari penjara pakai kartu!`;
  } else if (method === "pay") {
    if (player.money >= 50) {
      player.money -= 50;
      player.inJail = false;
      player.jailTurns = 0;
      newState.message = `${player.name} bayar M50 dan bebas dari penjara!`;
    }
  } else if (method === "roll") {
    // Will attempt double on next roll
    player.jailTurns++;
    if (player.jailTurns >= 3) {
      player.money -= 50;
      player.inJail = false;
      player.jailTurns = 0;
      newState.message = `${player.name} harus bayar M50 setelah 3 giliran di penjara!`;
    }
  }
  newState.phase = "rolling";
  return newState;
}

export function buildHouse(state: GameState, tileId: number): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const tile = newState.tiles[tileId];

  if (tile.ownerId !== player.id) return newState;
  if (tile.hotel) return newState;

  const groupTiles = newState.tiles.filter(t => t.group === tile.group && t.type === "property");
  const allOwned = groupTiles.every(t => t.ownerId === player.id);
  if (!allOwned) return newState;

  const cost = tile.houseCost ?? 0;
  if (player.money < cost) return newState;

  player.money -= cost;
  if (tile.houses < 4) {
    tile.houses++;
    newState.log.push(`${player.name} bangun rumah di ${tile.name}`);
  } else {
    tile.houses = 0;
    tile.hotel = true;
    newState.log.push(`${player.name} bangun hotel di ${tile.name}`);
  }

  return newState;
}

function advanceTurn(state: GameState): GameState {
  const newState = deepClone(state);

  if (state.doublesCount > 0 && state.phase !== "jail") {
    newState.doublesCount = 0;
    newState.phase = "rolling";
    newState.message = `${getCurrentPlayer(newState).name} dapat giliran lagi (doubles)!`;
    return newState;
  }

  newState.doublesCount = 0;
  let next = (newState.currentPlayerIndex + 1) % newState.players.length;
  let tries = 0;
  while (newState.players[next].bankrupt && tries < newState.players.length) {
    next = (next + 1) % newState.players.length;
    tries++;
  }
  newState.currentPlayerIndex = next;
  newState.phase = "rolling";
  const nextPlayer = newState.players[next];

  if (nextPlayer.inJail) {
    newState.message = `${nextPlayer.name} di penjara (giliran ${nextPlayer.jailTurns + 1}/3). Lempar dadu atau bayar M50.`;
  } else {
    newState.message = `Giliran ${nextPlayer.name}! Lempar dadu.`;
  }

  return newState;
}

function checkWinner(state: GameState): GameState {
  const active = state.players.filter(p => !p.bankrupt);
  if (active.length === 1) {
    const newState = deepClone(state);
    newState.winner = active[0];
    newState.phase = "game-over";
    newState.message = `🏆 ${active[0].name} MENANG!`;
    return newState;
  }
  return state;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function performRoll(state: GameState): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const roll = rollDice();
  newState.dice = [roll.d1, roll.d2];
  newState.lastRoll = [roll.d1, roll.d2];

  if (player.inJail) {
    if (roll.isDouble) {
      player.inJail = false;
      player.jailTurns = 0;
      newState.message = `${player.name} lempar ganda dan bebas dari penjara!`;
      newState.log.push(`${player.name} bebas dari penjara dengan doubles!`);
      return moveAndLand(newState, roll.d1 + roll.d2);
    } else {
      player.jailTurns++;
      if (player.jailTurns >= 3) {
        player.money -= 50;
        player.inJail = false;
        player.jailTurns = 0;
        newState.message = `${player.name} bayar M50 keluar penjara!`;
        return moveAndLand(newState, roll.d1 + roll.d2);
      }
      newState.message = `${player.name} tidak dapat ganda (${roll.d1}+${roll.d2}). Giliran ke ${player.jailTurns}/3.`;
      newState.log.push(`${player.name} masih di penjara (${player.jailTurns}/3)`);
      newState.phase = "jail";
      return advanceTurn(newState);
    }
  }

  if (roll.isDouble) {
    newState.doublesCount++;
    if (newState.doublesCount >= 3) {
      player.position = 10;
      player.inJail = true;
      player.jailTurns = 0;
      newState.doublesCount = 0;
      newState.message = `${player.name} lempar ganda 3 kali! Masuk penjara!`;
      newState.log.push(`${player.name} masuk penjara karena doubles 3x!`);
      newState.phase = "jail";
      return advanceTurn(newState);
    }
  } else {
    newState.doublesCount = 0;
  }

  newState.message = `${player.name} lempar ${roll.d1 + roll.d2} (${roll.d1}+${roll.d2})${roll.isDouble ? " - Doubles!" : ""}`;
  newState.log.push(`${player.name} lempar ${roll.d1}+${roll.d2}=${roll.d1 + roll.d2}`);
  return moveAndLand(newState, roll.d1 + roll.d2);
}

function moveAndLand(state: GameState, steps: number): GameState {
  const moved = movePlayer(state, steps);
  moved.phase = "moving";
  return moved;
}
