import { GameState, Player, Tile } from "../game/types";

interface ActionSheetProps {
  gameState: GameState;
  currentPlayer: Player;
  isRolling: boolean;
  onRoll: () => void;
  onBuy: (initialHouses?: number) => void;
  onSkipBuy: () => void;
  onPayRent: () => void;
  onRebut: () => void;
  onPayTax: () => void;
  onCardAction: () => void;
  onJailAction: (method: "card" | "pay" | "roll") => void;
  onJailContinue: () => void;
  onBuildHouse: (tileId: number) => void;
  onToggleBuilding: () => void;
  onRestartGame: () => void;
}

function getBuildLabel(tile: Tile): { icon: string; next: string; cost: number; isMax: boolean } {
  if (tile.landmark) return { icon: "🏛️", next: "MAX", cost: 0, isMax: true };
  if (tile.hotel)   return { icon: "🏨", next: "🏛️ Landmark", cost: (tile.hotelCost ?? tile.houseCost ?? 0) * 2, isMax: false };
  const houseIcons = ["🏚️", "🏠", "🏠🏠", "🏠🏠🏠", "🏠🏠🏠🏠"];
  const nextIcons  = ["🏠", "🏠🏠", "🏠🏠🏠", "🏠🏠🏠🏠", "🏨 Hotel"];
  const h = tile.houses;
  if (h >= 4) return { icon: houseIcons[4], next: "🏨 Hotel", cost: tile.hotelCost ?? tile.houseCost ?? 0, isMax: false };
  return { icon: houseIcons[h], next: nextIcons[h], cost: tile.houseCost ?? 0, isMax: false };
}

export default function ActionSheet({
  gameState, currentPlayer, isRolling,
  onRoll, onBuy, onSkipBuy, onPayRent, onRebut, onPayTax,
  onCardAction, onJailAction, onJailContinue,
  onBuildHouse, onToggleBuilding, onRestartGame,
}: ActionSheetProps) {
  const { phase, tiles, currentCard, pendingRent, winner } = gameState;
  const tile = tiles[currentPlayer.position];

  const buildableTiles = currentPlayer.properties
    .map(pid => tiles[pid])
    .filter(t => {
      if (t.type !== "property" || t.landmark) return false;
      const groupTiles = tiles.filter(gt => gt.group === t.group && gt.type === "property");
      const allOwned = groupTiles.every(gt => gt.ownerId === currentPlayer.id);
      if (!allOwned) return false;
      const { cost } = getBuildLabel(t);
      return currentPlayer.money >= cost;
    });

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

  if (phase === "hold-dice" || phase === "rolling") {
    return (
      <BottomSheet>
        <div className="flex gap-2 items-center">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 truncate">📍 {tile.name}</div>
            <div className="text-xs text-gray-500">M{currentPlayer.money.toLocaleString()}</div>
          </div>
          {buildableTiles.length > 0 && (
            <SmallBtn onClick={onToggleBuilding} color="bg-green-700">🏗️</SmallBtn>
          )}
          <BigBtn onClick={onRoll} color={isRolling ? "bg-gray-600" : "bg-blue-600"} disabled={isRolling}>
            {isRolling ? "⏳ Melempar..." : "🎲 Lempar Dadu"}
          </BigBtn>
        </div>
      </BottomSheet>
    );
  }

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

  if (phase === "buying") {
    const groupTiles = tiles.filter(gt => gt.group === tile.group && gt.type === "property");
    const ownsAll = groupTiles.every(gt => gt.ownerId === currentPlayer.id || gt.id === tile.id);
    const basePrice = tile.price ?? 0;

    return (
      <BottomSheet>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm truncate">{tile.name}</div>
              <div className="text-yellow-300 font-black text-xl">M{basePrice}</div>
              <div className="text-[11px] text-gray-400">
                Sewa: M{tile.rent?.[0] ?? tile.railroadRent?.[0] ?? "4-10×dadu"} · Saldo: M{currentPlayer.money}
              </div>
            </div>
            <SmallBtn onClick={onSkipBuy} color="bg-gray-700">❌ Lewati</SmallBtn>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <BigBtn onClick={() => onBuy(0)} color="bg-green-700" disabled={currentPlayer.money < basePrice}>
              🏚️ Beli M{basePrice}
            </BigBtn>

            {ownsAll && tile.type === "property" && [1, 2, 3, 4].map(h => {
              const total = basePrice + (tile.houseCost ?? 0) * h;
              const houseIcons = ["🏠", "🏠🏠", "🏠🏠🏠", "🏠🏠🏠🏠"];
              return (
                <SmallBtn key={h} onClick={() => onBuy(h)} color="bg-green-800"
                  disabled={currentPlayer.money < total}>
                  {houseIcons[h - 1]} M{total}
                </SmallBtn>
              );
            })}

            {ownsAll && tile.type === "property" && (() => {
              const total = basePrice + (tile.houseCost ?? 0) * 4 + (tile.hotelCost ?? tile.houseCost ?? 0);
              return (
                <SmallBtn onClick={() => onBuy(5)} color="bg-red-800"
                  disabled={currentPlayer.money < total}>
                  🏨 Hotel M{total}
                </SmallBtn>
              );
            })()}
          </div>
        </div>
      </BottomSheet>
    );
  }

  if (phase === "paying-rent" && pendingRent) {
    const owner = gameState.players.find(p => p.id === pendingRent.ownerId);
    const isLandmark = tile.landmark;
    const canRebut = !isLandmark && currentPlayer.money >= pendingRent.amount + (tile.price ?? 0);
    const rebutCost = pendingRent.amount + (tile.price ?? 0);

    return (
      <BottomSheet accent={isLandmark ? "border-yellow-500/60" : "border-red-500/60"}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {isLandmark && <span className="text-yellow-400 text-lg">🏛️</span>}
            <div className="flex-1 min-w-0">
              <div className="text-gray-400 text-xs">
                {isLandmark ? "LANDMARK" : "Sewa"} → {owner?.name}
                {isLandmark && <span className="text-yellow-400 font-bold"> · Tidak bisa direbut</span>}
              </div>
              <div className={`font-black text-2xl ${isLandmark ? "text-yellow-300" : "text-red-400"}`}>
                M{pendingRent.amount}
                {isLandmark && <span className="text-sm text-yellow-500 ml-1">(sewa ×2)</span>}
              </div>
              <div className="text-[11px] text-gray-500">Saldo: M{currentPlayer.money}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <BigBtn onClick={onPayRent} color={isLandmark ? "bg-yellow-700" : "bg-red-600"}>
              💸 Bayar M{pendingRent.amount}
            </BigBtn>
            {canRebut && (
              <BigBtn onClick={onRebut} color="bg-orange-600">
                ⚔️ Rebut M{rebutCost}
              </BigBtn>
            )}
          </div>
        </div>
      </BottomSheet>
    );
  }

  if (phase === "rebuting") {
    return (
      <BottomSheet accent="border-orange-500/60">
        <div className="text-center text-orange-400 text-sm py-1 animate-pulse">⚔️ Merebut properti...</div>
      </BottomSheet>
    );
  }

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

  if (phase === "building") {
    return (
      <BottomSheet>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-sm">🏗️ Upgrade Properti</span>
            <SmallBtn onClick={onToggleBuilding} color="bg-gray-700">✓ Selesai</SmallBtn>
          </div>
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
            {buildableTiles.map(t => {
              const { icon, next, cost, isMax } = getBuildLabel(t);
              const isLandmark = next.includes("Landmark");
              return (
                <button
                  key={t.id}
                  onClick={() => !isMax && onBuildHouse(t.id)}
                  disabled={isMax}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95
                    ${isMax
                      ? "bg-yellow-900/40 border border-yellow-600/40 cursor-default"
                      : isLandmark
                      ? "bg-yellow-800/60 border border-yellow-500/60 hover:bg-yellow-700/60"
                      : "bg-green-900/60 border border-green-600/40 hover:bg-green-800/60"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <span className={isMax ? "text-yellow-400" : "text-white"}>{t.name}</span>
                    {isMax && <span className="text-yellow-500 text-[10px] font-bold">🏛️ LANDMARK · Tidak bisa direbut</span>}
                  </div>
                  {!isMax && (
                    <span className={`flex-shrink-0 font-bold ${isLandmark ? "text-yellow-300" : "text-green-300"}`}>
                      {next} +M{cost}
                    </span>
                  )}
                </button>
              );
            })}
            {buildableTiles.length === 0 && (
              <div className="text-gray-500 text-xs text-center py-2">Tidak ada properti yang bisa di-upgrade</div>
            )}
          </div>
        </div>
      </BottomSheet>
    );
  }

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
      className={`${color} disabled:opacity-40 text-white font-bold text-sm px-4 rounded-xl active:scale-95 transition-all flex-shrink-0 flex items-center justify-center`}
      style={{ minHeight: 48, minWidth: 110 }}
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
