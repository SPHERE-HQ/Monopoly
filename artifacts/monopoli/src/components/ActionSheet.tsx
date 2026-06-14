import { GameState, Player } from "../game/types";
import { BOARD_TILES } from "../game/board";

interface ActionSheetProps {
  gameState: GameState;
  currentPlayer: Player;
  isRolling: boolean;
  onRoll: () => void;
  onBuy: () => void;
  onSkipBuy: () => void;
  onPayRent: () => void;
  onPayTax: () => void;
  onCardAction: () => void;
  onJailAction: (method: "card" | "pay" | "roll") => void;
  onJailContinue: () => void;
  onBuildHouse: (tileId: number) => void;
  onToggleBuilding: () => void;
  onRestartGame: () => void;
}

export default function ActionSheet({
  gameState, currentPlayer, isRolling,
  onRoll, onBuy, onSkipBuy, onPayRent, onPayTax,
  onCardAction, onJailAction, onJailContinue,
  onBuildHouse, onToggleBuilding, onRestartGame,
}: ActionSheetProps) {
  const { phase, tiles, currentCard, pendingRent, winner } = gameState;
  const tile = tiles[currentPlayer.position];

  const buildableTiles = currentPlayer.properties.map(pid => tiles[pid]).filter(t => {
    if (t.type !== "property" || t.hotel) return false;
    const groupTiles = tiles.filter(gt => gt.group === t.group && gt.type === "property");
    return groupTiles.every(gt => gt.ownerId === currentPlayer.id) && currentPlayer.money >= (t.houseCost ?? 0);
  });

  // ── GAME OVER ──────────────────────────────────────────────────────────
  if (phase === "game-over" && winner) {
    return (
      <BottomSheet>
        <div className="text-center py-2">
          <div className="text-3xl mb-1">🏆</div>
          <div className="text-yellow-300 font-black text-lg mb-3">{winner.name} MENANG!</div>
          <BigBtn onClick={onRestartGame} color="bg-green-600">Main Lagi</BigBtn>
        </div>
      </BottomSheet>
    );
  }

  // ── ROLLING / IDLE ─────────────────────────────────────────────────────
  if (phase === "rolling") {
    return (
      <BottomSheet>
        <div className="flex gap-2 items-center">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 truncate">📍 {tile.name}</div>
            <div className="text-xs text-gray-500">M{currentPlayer.money.toLocaleString()}</div>
          </div>
          {buildableTiles.length > 0 && (
            <SmallBtn onClick={onToggleBuilding} color="bg-green-700">🏠</SmallBtn>
          )}
          <BigBtn onClick={onRoll} color={isRolling ? "bg-gray-600" : "bg-blue-600"} disabled={isRolling}>
            {isRolling ? "⏳ Melempar..." : "🎲 Lempar Dadu"}
          </BigBtn>
        </div>
      </BottomSheet>
    );
  }

  // ── PENJARA ────────────────────────────────────────────────────────────
  if (phase === "jail" && currentPlayer.inJail) {
    return (
      <BottomSheet>
        <div className="text-center text-orange-400 font-bold text-sm mb-2">
          🔒 Di Penjara — Giliran {currentPlayer.jailTurns + 1}/3
        </div>
        <div className="flex gap-2">
          {currentPlayer.getOutOfJailCards > 0 && (
            <SmallBtn onClick={() => onJailAction("card")} color="bg-blue-700">🃏 Kartu</SmallBtn>
          )}
          <SmallBtn onClick={() => onJailAction("pay")} color="bg-yellow-600" disabled={currentPlayer.money < 50}>
            💰 M50
          </SmallBtn>
          <BigBtn onClick={() => onJailAction("roll")} color={isRolling ? "bg-gray-600" : "bg-gray-700"} disabled={isRolling}>
            {isRolling ? "⏳" : "🎲 Coba Ganda"}
          </BigBtn>
        </div>
      </BottomSheet>
    );
  }

  if (phase === "jail" && !currentPlayer.inJail) {
    return (
      <BottomSheet>
        <BigBtn onClick={onJailContinue} color="bg-gray-700">Lanjut ▶</BigBtn>
      </BottomSheet>
    );
  }

  // ── BELI PROPERTI ──────────────────────────────────────────────────────
  if (phase === "buying") {
    return (
      <BottomSheet>
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-sm truncate">{tile.name}</div>
            <div className="text-yellow-300 font-black text-lg">M{tile.price}</div>
            <div className="text-[11px] text-gray-400">
              Sewa dasar: M{tile.rent?.[0] ?? tile.railroadRent?.[0] ?? "4-10×dadu"} · Saldo: M{currentPlayer.money}
            </div>
          </div>
          <SmallBtn onClick={onSkipBuy} color="bg-gray-700">❌</SmallBtn>
          <BigBtn onClick={onBuy} color="bg-green-600" disabled={currentPlayer.money < (tile.price ?? 0)}>
            ✅ Beli M{tile.price}
          </BigBtn>
        </div>
      </BottomSheet>
    );
  }

  // ── BAYAR SEWA ─────────────────────────────────────────────────────────
  if (phase === "paying-rent" && pendingRent) {
    const owner = gameState.players.find(p => p.id === pendingRent.ownerId);
    return (
      <BottomSheet accent="border-red-500/60">
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0">
            <div className="text-gray-400 text-xs">Bayar sewa ke {owner?.name}</div>
            <div className="text-red-400 font-black text-2xl">M{pendingRent.amount}</div>
            <div className="text-[11px] text-gray-500">Saldo: M{currentPlayer.money}</div>
          </div>
          <BigBtn onClick={onPayRent} color="bg-red-600">💸 Bayar</BigBtn>
        </div>
      </BottomSheet>
    );
  }

  // ── PAJAK ──────────────────────────────────────────────────────────────
  if (phase === "income-tax" || phase === "luxury-tax") {
    const amount = tiles[currentPlayer.position].taxAmount ?? 0;
    const label = phase === "income-tax" ? "Pajak Penghasilan" : "Pajak Kemewahan";
    return (
      <BottomSheet accent="border-red-500/60">
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <div className="text-gray-400 text-xs">{label}</div>
            <div className="text-red-400 font-black text-2xl">M{amount}</div>
          </div>
          <BigBtn onClick={onPayTax} color="bg-red-700">💸 Bayar Pajak</BigBtn>
        </div>
      </BottomSheet>
    );
  }

  // ── KARTU ──────────────────────────────────────────────────────────────
  if (phase === "chance" || phase === "community-chest") {
    const isChance = phase === "chance";
    return (
      <BottomSheet accent={isChance ? "border-orange-500/60" : "border-teal-500/60"}>
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-bold mb-0.5 ${isChance ? "text-orange-400" : "text-teal-400"}`}>
              {isChance ? "🎴 Kesempatan" : "📦 Kas Umum"}
            </div>
            <div className="text-white text-xs leading-tight">{currentCard?.text}</div>
          </div>
          <BigBtn onClick={onCardAction} color="bg-purple-600">✨ Jalankan</BigBtn>
        </div>
      </BottomSheet>
    );
  }

  // ── BANGUN ─────────────────────────────────────────────────────────────
  if (phase === "building") {
    return (
      <BottomSheet>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-sm">🏠 Bangun Rumah / Hotel</span>
            <SmallBtn onClick={onToggleBuilding} color="bg-gray-700">Selesai</SmallBtn>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {buildableTiles.map(t => (
              <button
                key={t.id}
                onClick={() => onBuildHouse(t.id)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-800 active:bg-green-600 text-white text-xs font-semibold"
              >
                <span>{t.name}</span>
                <span className="text-green-300 text-[10px]">{t.hotel ? "Max" : `${t.houses}🏠 +M${t.houseCost}`}</span>
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    );
  }

  // ── MOVING ─────────────────────────────────────────────────────────────
  if (phase === "moving") {
    return (
      <BottomSheet>
        <div className="text-center text-gray-400 text-sm py-1">
          <span className="animate-pulse">🚶 Memindahkan pion...</span>
        </div>
      </BottomSheet>
    );
  }

  return null;
}

// ── Reusable primitives ───────────────────────────────────────────────────

function BottomSheet({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-20 px-3 py-2.5 border-t ${accent ?? "border-white/10"}`}
      style={{ background: "linear-gradient(to top, rgba(10,12,20,0.97) 60%, rgba(10,12,20,0.85) 100%)" }}
    >
      {children}
    </div>
  );
}

function BigBtn({
  onClick, color, disabled = false, children,
}: {
  onClick: () => void;
  color: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${color} disabled:opacity-40 text-white font-bold text-sm px-5 rounded-xl active:scale-95 transition-all flex-shrink-0 flex items-center justify-center`}
      style={{ minHeight: 48, minWidth: 120 }}
    >
      {children}
    </button>
  );
}

function SmallBtn({
  onClick, color, disabled = false, children,
}: {
  onClick: () => void;
  color: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${color} disabled:opacity-40 text-white font-bold text-xs px-3 rounded-xl active:scale-95 transition-all flex-shrink-0 flex items-center justify-center`}
      style={{ minHeight: 44 }}
    >
      {children}
    </button>
  );
}
