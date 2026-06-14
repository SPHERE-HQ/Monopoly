import { GameState, Player, Tile, DiceRoll } from "./types";
import { BOARD_TILES } from "./board";
import { CHANCE_CARDS, COMMUNITY_CARDS, shuffleCards } from "./cards";

export function rollDice(): DiceRoll {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return { d1, d2, isDouble: d1 === d2 };
}

export function createInitialState(playerNames: string[], _playerColors: string[]): GameState {
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

  const tiles: Tile[] = BOARD_TILES.map(t => ({ ...t, landmark: false, landmarkReady: false }));

  return {
    players,
    tiles,
    currentPlayerIndex: 0,
    phase: "hold-dice",
    dice: [1, 1],
    lastRoll: null,
    doublesCount: 0,
    message: `Giliran ${players[0].name}! Gesek dadu untuk lempar.`,
    winner: null,
    chanceCards: shuffleCards(CHANCE_CARDS),
    communityCards: shuffleCards(COMMUNITY_CARDS),
    currentCard: null,
    pendingRent: null,
    log: [`Permainan dimulai! ${playerNames.join(", ")} siap bermain.`],
    moveOrigin: undefined,
    buildingFromLanding: false,
  };
}

export function getCurrentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

export function movePlayer(state: GameState, steps: number): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  newState.moveOrigin = player.position;
  const newPos = (player.position + steps) % 40;

  if (newPos < player.position && steps > 0) {
    player.money += 200;
    newState.log.push(`${player.name} melewati GO! Dapat M200`);
  }

  player.position = newPos;
  return newState;
}

export function performRollWithValues(state: GameState, d1: number, d2: number): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const isDouble = d1 === d2;
  newState.dice = [d1, d2];
  newState.lastRoll = [d1, d2];

  if (player.inJail) {
    if (isDouble) {
      player.inJail = false;
      player.jailTurns = 0;
      newState.message = `${player.name} lempar ganda dan bebas dari penjara!`;
      newState.log.push(`${player.name} bebas dari penjara dengan doubles!`);
      return moveAndLand(newState, d1 + d2);
    } else {
      player.jailTurns++;
      if (player.jailTurns >= 3) {
        player.money -= 50;
        player.inJail = false;
        player.jailTurns = 0;
        newState.message = `${player.name} bayar M50 keluar penjara!`;
        return moveAndLand(newState, d1 + d2);
      }
      newState.message = `${player.name} tidak dapat ganda (${d1}+${d2}). Giliran ke ${player.jailTurns}/3.`;
      newState.log.push(`${player.name} masih di penjara (${player.jailTurns}/3)`);
      newState.phase = "jail";
      return advanceTurn(newState);
    }
  }

  if (isDouble) {
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

  newState.message = `${player.name} lempar ${d1 + d2} (${d1}+${d2})${isDouble ? " — Doubles!" : ""}`;
  newState.log.push(`${player.name} lempar ${d1}+${d2}=${d1 + d2}`);
  return moveAndLand(newState, d1 + d2);
}

export function handleLanding(state: GameState): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const tile = newState.tiles[player.position];

  newState.currentCard = null;

  switch (tile.type) {
    case "go":
      newState.phase = "hold-dice";
      newState.message = `${player.name} mendarat di GO!`;
      newState.log.push(`${player.name} mendarat di GO!`);
      return advanceTurn(newState);

    case "jail":
      newState.phase = "hold-dice";
      newState.message = `${player.name} hanya berkunjung ke Penjara.`;
      return advanceTurn(newState);

    case "free-parking":
      newState.phase = "hold-dice";
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
        // Mendarat di properti sendiri — cek apakah ada hotel → aktifkan landmark
        if (tile.hotel && !tile.landmark) {
          tile.landmarkReady = true;
          newState.buildingFromLanding = true;
          newState.phase = "building";
          newState.message = `🏛️ ${player.name} mendarat di HOTEL miliknya di ${tile.name}! Sekarang bisa upgrade ke Landmark!`;
          newState.log.push(`${player.name} mendarat di hotelnya di ${tile.name} → Landmark tersedia!`);
          return newState;
        }
        newState.phase = "hold-dice";
        newState.message = `${player.name} mendarat di properti sendiri.`;
        return advanceTurn(newState);
      } else if (tile.mortgaged) {
        newState.phase = "hold-dice";
        newState.message = `${tile.name} sedang dijaminkan, tidak ada sewa.`;
        return advanceTurn(newState);
      } else {
        const rent = calculateRent(newState, tile, player);
        const owner = newState.players.find(p => p.id === tile.ownerId)!;
        const canRebut = !tile.landmark && player.money >= rent + (tile.price ?? 0);
        newState.phase = "paying-rent";
        newState.pendingRent = { amount: rent, ownerId: owner.id };
        if (tile.landmark) {
          newState.message = `${player.name} di LANDMARK ${tile.name}! Sewa ×2 = M${rent}. Tidak bisa direbut!`;
        } else if (canRebut) {
          newState.message = `${player.name} di ${tile.name} milik ${owner.name}. Sewa M${rent} atau rebut?`;
        } else {
          newState.message = `${player.name} harus bayar sewa M${rent} ke ${owner.name}!`;
        }
        newState.log.push(`${player.name} mendarat di ${tile.landmark ? "🏛️ LANDMARK " : ""}${tile.name} (${owner.name}) — sewa M${rent}`);
      }
      return newState;

    default:
      return advanceTurn(newState);
  }
}

function calculateRent(state: GameState, tile: Tile, _payer: Player): number {
  if (tile.type === "railroad") {
    const owned = state.tiles.filter(t => t.type === "railroad" && t.ownerId === tile.ownerId).length;
    return tile.railroadRent![owned - 1];
  }
  if (tile.type === "utility") {
    const owned = state.tiles.filter(t => t.type === "utility" && t.ownerId === tile.ownerId).length;
    return tile.utilityMultiplier![owned - 1] * (state.dice[0] + state.dice[1]);
  }
  if (tile.landmark) return tile.rent![5] * 2;
  if (tile.hotel) return tile.rent![5];
  if (tile.houses > 0) return tile.rent![tile.houses];
  const groupTiles = state.tiles.filter(t => t.group === tile.group && t.type === "property");
  const allOwned = groupTiles.every(t => t.ownerId === tile.ownerId);
  return allOwned ? tile.rent![0] * 2 : tile.rent![0];
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
      if (action.to < player.position) { player.money += 200; newState.log.push(`${player.name} melewati GO! Dapat M200`); }
      player.position = action.to;
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
      return advanceTurn(newState);
    }
    case "money-per-player": {
      const others = newState.players.filter(p => p.id !== player.id && !p.bankrupt);
      if (action.amount > 0) {
        others.forEach(p => { p.money -= action.amount; player.money += action.amount; });
      } else {
        others.forEach(p => { player.money += action.amount; p.money -= action.amount; });
      }
      newState.currentCard = null;
      return advanceTurn(newState);
    }
    case "get-out-of-jail": {
      player.getOutOfJailCards++;
      newState.currentCard = null;
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
      const totalH = player.properties.reduce((s, pid) => s + (newState.tiles[pid].hotel ? 0 : newState.tiles[pid].houses), 0);
      const totalHotel = player.properties.reduce((s, pid) => s + (newState.tiles[pid].hotel ? 1 : 0), 0);
      player.money -= totalH * action.house + totalHotel * action.hotel;
      newState.log.push(`${player.name} bayar perbaikan M${totalH * action.house + totalHotel * action.hotel}`);
      newState.currentCard = null;
      return advanceTurn(newState);
    }
    case "move-to-nearest-railroad": {
      const rr = [5, 15, 25, 35];
      const nearest = rr.reduce((p, c) => Math.abs(c - player.position) < Math.abs(p - player.position) ? c : p);
      if (nearest < player.position) player.money += 200;
      player.position = nearest;
      newState.currentCard = null;
      return handleLanding(newState);
    }
    case "move-to-nearest-utility": {
      const util = [12, 28];
      const nearest = util.reduce((p, c) => Math.abs(c - player.position) < Math.abs(p - player.position) ? c : p);
      if (nearest < player.position) player.money += 200;
      player.position = nearest;
      newState.currentCard = null;
      return handleLanding(newState);
    }
    default:
      newState.currentCard = null;
      return advanceTurn(newState);
  }
}

export function buyProperty(state: GameState, initialHouses = 0): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const tile = newState.tiles[player.position];

  const groupTiles = newState.tiles.filter(t => t.group === tile.group && t.type === "property");
  const ownsGroup = groupTiles.every(t => t.ownerId === player.id || t.id === tile.id);
  const housesToBuild = ownsGroup ? initialHouses : 0;
  const totalCost = (tile.price ?? 0) + housesToBuild * (tile.houseCost ?? 0);

  if (player.money < totalCost) {
    newState.message = "Uang tidak cukup!";
    return advanceTurn(newState);
  }

  player.money -= totalCost;
  tile.ownerId = player.id;
  player.properties.push(tile.id);

  let buildMsg = "";
  if (housesToBuild > 0 && housesToBuild <= 4) { tile.houses = housesToBuild; buildMsg = ` + ${housesToBuild} rumah`; }
  else if (housesToBuild === 5) { tile.hotel = true; buildMsg = ` + hotel`; }

  newState.log.push(`${player.name} membeli ${tile.name} (M${tile.price})${buildMsg}`);
  newState.phase = "hold-dice";
  newState.message = `${player.name} membeli ${tile.name}${buildMsg}!`;
  return advanceTurn(newState);
}

export function skipBuying(state: GameState): GameState {
  const newState = deepClone(state);
  newState.phase = "hold-dice";
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
  newState.phase = "hold-dice";

  if (player.money <= 0) {
    player.bankrupt = true;
    player.money = 0;
    newState.log.push(`${player.name} BANGKRUT!`);
    newState.message = `${player.name} bangkrut!`;
    player.properties.forEach(pid => {
      newState.tiles[pid].ownerId = null;
      newState.tiles[pid].houses = 0;
      newState.tiles[pid].hotel = false;
      newState.tiles[pid].landmark = false;
      newState.tiles[pid].landmarkReady = false;
    });
    player.properties = [];
  }

  return checkWinner(advanceTurn(newState));
}

export function rebutProperty(state: GameState): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const tile = newState.tiles[player.position];

  if (tile.landmark) {
    newState.message = "🏛️ Landmark tidak bisa direbut!";
    return newState;
  }

  const { amount: rent, ownerId } = newState.pendingRent!;
  const owner = newState.players.find(p => p.id === ownerId)!;
  const totalCost = rent + (tile.price ?? 0);

  if (player.money < totalCost) {
    newState.message = "Uang tidak cukup untuk merebut!";
    return newState;
  }

  player.money -= totalCost;
  owner.money += rent;
  const oldIdx = owner.properties.indexOf(tile.id);
  if (oldIdx !== -1) owner.properties.splice(oldIdx, 1);
  tile.ownerId = player.id;
  tile.houses = 0;
  tile.hotel = false;
  tile.landmarkReady = false;
  player.properties.push(tile.id);

  newState.pendingRent = null;
  newState.log.push(`${player.name} MEREBUT ${tile.name} dari ${owner.name}! (sewa M${rent} + harga M${tile.price})`);
  newState.message = `${player.name} berhasil merebut ${tile.name}!`;
  newState.phase = "hold-dice";
  return checkWinner(advanceTurn(newState));
}

export function payTax(state: GameState): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const tile = newState.tiles[player.position];
  player.money -= tile.taxAmount ?? 0;
  newState.log.push(`${player.name} bayar pajak M${tile.taxAmount}`);
  newState.phase = "hold-dice";
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
    newState.phase = "hold-dice";
  } else if (method === "pay" && player.money >= 50) {
    player.money -= 50;
    player.inJail = false;
    player.jailTurns = 0;
    newState.message = `${player.name} bayar M50 dan bebas dari penjara!`;
    newState.phase = "hold-dice";
  }
  return newState;
}

export function buildHouse(state: GameState, tileId: number): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const tile = newState.tiles[tileId];

  if (tile.ownerId !== player.id) return newState;
  if (tile.landmark) return newState;

  const groupTiles = newState.tiles.filter(t => t.group === tile.group && t.type === "property");
  const allOwned = groupTiles.every(t => t.ownerId === player.id);
  if (!allOwned) return newState;

  // Upgrade hotel → Landmark: hanya bisa jika landmarkReady (pernah mendarat di hotel ini)
  if (tile.hotel) {
    if (!tile.landmarkReady) {
      newState.message = `⚠️ Harus mendarat di hotel ${tile.name} dulu untuk bangun Landmark!`;
      return newState;
    }
    const landmarkCost = (tile.hotelCost ?? tile.houseCost ?? 0) * 2;
    if (player.money < landmarkCost) {
      newState.message = `Uang tidak cukup! Perlu M${landmarkCost}`;
      return newState;
    }
    player.money -= landmarkCost;
    tile.hotel = false;
    tile.landmark = true;
    tile.landmarkReady = false;
    newState.log.push(`${player.name} bangun 🏛️ LANDMARK di ${tile.name}! Tidak bisa direbut, sewa ×2`);
    newState.message = `🏛️ ${player.name} membangun LANDMARK di ${tile.name}!`;
    return newState;
  }

  const cost = tile.houseCost ?? 0;
  if (player.money < cost) return newState;

  player.money -= cost;
  if (tile.houses < 4) {
    tile.houses++;
    const icons = ["", "🏠", "🏠🏠", "🏠🏠🏠", "🏠🏠🏠🏠"];
    newState.log.push(`${player.name} bangun ${icons[tile.houses]} di ${tile.name}`);
    newState.message = `${player.name} bangun ${tile.houses >= 3 ? "🏢 Apartemen" : "🏠 Rumah"} di ${tile.name}!`;
  } else {
    tile.houses = 0;
    tile.hotel = true;
    newState.log.push(`${player.name} bangun 🏨 Hotel di ${tile.name}`);
    newState.message = `${player.name} bangun 🏨 Hotel di ${tile.name}!`;
  }

  return newState;
}

export function closeBuildingPanel(state: GameState): GameState {
  const newState = deepClone(state);
  if (newState.buildingFromLanding) {
    newState.buildingFromLanding = false;
    return advanceTurn(newState);
  }
  newState.phase = "hold-dice";
  return newState;
}

function advanceTurn(state: GameState): GameState {
  const newState = deepClone(state);

  if (state.doublesCount > 0 && state.phase !== "jail") {
    newState.doublesCount = 0;
    newState.phase = "hold-dice";
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
  newState.phase = "hold-dice";
  const nextPlayer = newState.players[next];

  if (nextPlayer.inJail) {
    newState.message = `${nextPlayer.name} di penjara (giliran ${nextPlayer.jailTurns + 1}/3). Tahan dadu atau bayar M50.`;
  } else {
    newState.message = `Giliran ${nextPlayer.name}! Gesek dadu untuk lempar.`;
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
  const roll = { d1: Math.floor(Math.random() * 6) + 1, d2: Math.floor(Math.random() * 6) + 1 };
  return performRollWithValues(state, roll.d1, roll.d2);
}

function moveAndLand(state: GameState, steps: number): GameState {
  const moved = movePlayer(state, steps);
  moved.phase = "moving";
  return moved;
}
