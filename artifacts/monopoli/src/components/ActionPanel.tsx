import { GameState, Player } from "../game/types";
import { BOARD_TILES } from "../game/board";
import { buildHouse } from "../game/engine";

interface ActionPanelProps {
  gameState: GameState;
  currentPlayer: Player;
  onRoll: () => void;
  onBuy: () => void;
  onSkipBuy: () => void;
  onPayRent: () => void;
  onPayTax: () => void;
  onCardAction: () => void;
  onJailAction: (method: "card" | "pay" | "roll") => void;
  onJailContinue: () => void;
  onBuildHouse: (tileId: number) => void;
  onEndBuilding: () => void;
  onRestartGame: () => void;
}

export default function ActionPanel({
  gameState, currentPlayer,
  onRoll, onBuy, onSkipBuy, onPayRent, onPayTax,
  onCardAction, onJailAction, onJailContinue,
  onBuildHouse, onEndBuilding, onRestartGame
}: ActionPanelProps) {
  const { phase, tiles, currentCard, pendingRent, winner } = gameState;
  const tile = tiles[currentPlayer.position];

  // Buildable properties
  const buildableTiles = currentPlayer.properties.map(pid => tiles[pid]).filter(t => {
    if (t.type !== "property") return false;
    if (t.hotel) return false;
    const groupTiles = tiles.filter(gt => gt.group === t.group && gt.type === "property");
    const allOwned = groupTiles.every(gt => gt.ownerId === currentPlayer.id);
    return allOwned && currentPlayer.money >= (t.houseCost ?? 0);
  });

  if (phase === "game-over" && winner) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">🏆</div>
        <div className="text-yellow-300 text-xl font-bold mb-2">{winner.name} MENANG!</div>
        <button
          onClick={onRestartGame}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
        >
          Main Lagi
        </button>
      </div>
    );
  }

  if (phase === "rolling") {
    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-300 font-medium">
          📍 {tile.name}
        </div>
        {gameState.lastRoll && (
          <div className="text-center text-2xl font-bold text-yellow-300">
            🎲 {gameState.lastRoll[0]} + {gameState.lastRoll[1]} = {gameState.lastRoll[0] + gameState.lastRoll[1]}
          </div>
        )}
        <button
          onClick={onRoll}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          🎲 Lempar Dadu
        </button>
        {buildableTiles.length > 0 && (
          <button
            onClick={onEndBuilding}
            className="w-full py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            🏠 Bangun Properti
          </button>
        )}
      </div>
    );
  }

  if (phase === "jail" && currentPlayer.inJail) {
    return (
      <div className="space-y-2">
        <div className="text-center text-orange-400 font-bold text-lg">🔒 DI PENJARA</div>
        <div className="text-xs text-gray-400 text-center">Giliran ke {currentPlayer.jailTurns + 1}/3</div>
        {currentPlayer.getOutOfJailCards > 0 && (
          <button onClick={() => onJailAction("card")}
            className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm font-bold rounded-lg">
            🃏 Pakai Kartu Bebas
          </button>
        )}
        <button onClick={() => onJailAction("pay")}
          className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-bold rounded-lg"
          disabled={currentPlayer.money < 50}>
          💰 Bayar M50
        </button>
        <button onClick={onRoll}
          className="w-full py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm font-bold rounded-lg">
          🎲 Lempar Dadu (coba ganda)
        </button>
      </div>
    );
  }

  if (phase === "jail" && !currentPlayer.inJail) {
    return (
      <button onClick={onJailContinue}
        className="w-full py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg">
        Lanjut ▶
      </button>
    );
  }

  if (phase === "buying") {
    return (
      <div className="space-y-3">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-white font-bold">{tile.name}</div>
          <div className="text-yellow-300 text-lg font-bold">M{tile.price}</div>
          <div className="text-xs text-gray-400 mt-1">
            Sewa dasar: M{tile.rent?.[0] ?? tile.railroadRent?.[0] ?? "4-10x dadu"}
          </div>
        </div>
        <div className="text-sm text-gray-300">Saldo: <span className="text-green-400 font-bold">M{currentPlayer.money}</span></div>
        <button onClick={onBuy}
          disabled={currentPlayer.money < (tile.price ?? 0)}
          className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
          ✅ Beli M{tile.price}
        </button>
        <button onClick={onSkipBuy}
          className="w-full py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-xl transition-colors">
          ❌ Lewati
        </button>
      </div>
    );
  }

  if (phase === "paying-rent" && pendingRent) {
    const owner = gameState.players.find(p => p.id === pendingRent.ownerId);
    return (
      <div className="space-y-3">
        <div className="bg-red-900/50 rounded-lg p-3 border border-red-500">
          <div className="text-white font-bold text-sm">Bayar Sewa ke {owner?.name}</div>
          <div className="text-red-400 text-2xl font-bold">M{pendingRent.amount}</div>
          <div className="text-xs text-gray-400">Saldo: M{currentPlayer.money}</div>
        </div>
        <button onClick={onPayRent}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors">
          💸 Bayar Sewa
        </button>
      </div>
    );
  }

  if (phase === "income-tax" || phase === "luxury-tax") {
    const amount = tiles[currentPlayer.position].taxAmount ?? 0;
    return (
      <div className="space-y-3">
        <div className="bg-gray-700 rounded-lg p-3 border border-gray-500">
          <div className="text-white font-bold">{phase === "income-tax" ? "Pajak Penghasilan" : "Pajak Kemewahan"}</div>
          <div className="text-red-400 text-2xl font-bold">M{amount}</div>
        </div>
        <button onClick={onPayTax}
          className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition-colors">
          💸 Bayar Pajak
        </button>
      </div>
    );
  }

  if (phase === "chance" || phase === "community-chest") {
    return (
      <div className="space-y-3">
        <div className={`rounded-lg p-3 border ${phase === "chance" ? "bg-orange-900/50 border-orange-500" : "bg-teal-900/50 border-teal-500"}`}>
          <div className={`font-bold text-sm mb-1 ${phase === "chance" ? "text-orange-300" : "text-teal-300"}`}>
            {phase === "chance" ? "🎴 Kartu Kesempatan" : "📦 Kas Umum"}
          </div>
          <div className="text-white text-sm">{currentCard?.text}</div>
        </div>
        <button onClick={onCardAction}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors">
          ✨ Jalankan
        </button>
      </div>
    );
  }

  if (phase === "building") {
    return (
      <div className="space-y-2">
        <div className="text-white font-bold text-sm">🏠 Bangun Rumah/Hotel</div>
        {buildableTiles.map(t => (
          <button key={t.id} onClick={() => onBuildHouse(t.id)}
            className="w-full py-2 bg-green-700 hover:bg-green-600 text-white text-xs font-semibold rounded-lg flex justify-between items-center px-3">
            <span>{t.name}</span>
            <span className="text-green-300">
              {t.hotel ? "Max" : `${t.houses}🏠 +M${t.houseCost}`}
            </span>
          </button>
        ))}
        <button onClick={onEndBuilding}
          className="w-full py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm font-semibold rounded-lg">
          Selesai
        </button>
      </div>
    );
  }

  if (phase === "moving") {
    return (
      <div className="text-center text-gray-400 text-sm">Memindahkan pion...</div>
    );
  }

  return null;
}
