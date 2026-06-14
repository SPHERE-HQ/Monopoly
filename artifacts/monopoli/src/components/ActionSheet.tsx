import { useState, useEffect, useRef } from "react";
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
  onOpenBuilding: () => void;
  onRestartGame: () => void;
}

const DICE_FACES = ["⚀","⚁","⚂","⚃","⚄","⚅"];

function DiceSwipe({ onRoll, isRolling, lastRoll }: {
  onRoll: () => void;
  isRolling: boolean;
  lastRoll: [number, number] | null;
}) {
  const [drag, setDrag] = useState<{ sx: number; sy: number; cx: number; cy: number } | null>(null);
  const [thrown, setThrown] = useState(false);
  const [faces, setFaces] = useState<[number, number]>([1, 1]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Kocok wajah dadu saat drag atau rolling
  useEffect(() => {
    if (!drag && !isRolling) {
      if (lastRoll) setFaces(lastRoll);
      return;
    }
    const iv = setInterval(() => {
      setFaces([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
    }, 70);
    return () => clearInterval(iv);
  }, [drag, isRolling, lastRoll]);

  const getDelta = () => {
    if (!drag) return { dx: 0, dy: 0, dist: 0 };
    const dx = (drag.cx - drag.sx) * 0.35;
    const dy = (drag.cy - drag.sy) * 0.35;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return { dx, dy, dist };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isRolling || thrown) return;
    e.preventDefault();
    setDrag({ sx: e.clientX, sy: e.clientY, cx: e.clientX, cy: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    setDrag(d => d ? { ...d, cx: e.clientX, cy: e.clientY } : null);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    setDrag(null);
    if (dist > 38) {
      setThrown(true);
      setTimeout(() => setThrown(false), 900);
      onRoll();
    }
  };

  const { dx, dy, dist } = getDelta();
  const power = Math.min(100, (dist / 40) * 100);

  return (
    <div className="flex flex-col items-center gap-2 py-1 select-none">
      {/* Power bar */}
      <div
        className="relative w-40 h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.1)", opacity: drag ? 1 : 0, transition: "opacity 0.15s" }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-none"
          style={{
            width: `${power}%`,
            background: power > 75
              ? "linear-gradient(90deg, #22c55e, #ef4444)"
              : "linear-gradient(90deg, #3b82f6, #22c55e)",
          }}
        />
      </div>

      {/* Dadu */}
      <div
        ref={containerRef}
        className="flex gap-4 touch-none"
        style={{
          transform: thrown
            ? "translateY(-40px) scale(0.7) rotate(360deg)"
            : drag
            ? `translate(${dx}px, ${dy}px) rotate(${dx * 0.8}deg)`
            : "translate(0,0) rotate(0deg)",
          transition: thrown
            ? "transform 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)"
            : drag
            ? "none"
            : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          cursor: isRolling ? "default" : "grab",
          animation: isRolling && !thrown ? "diceShake 0.15s ease-in-out infinite" : undefined,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setDrag(null)}
      >
        {[0, 1].map(i => (
          <div
            key={i}
            className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-4xl font-black"
            style={{
              boxShadow: drag
                ? "0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.8)"
                : "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8)",
              transform: drag ? `rotate(${(i === 0 ? -1 : 1) * dx * 0.4}deg)` : "none",
              transition: drag ? "none" : "transform 0.3s",
              color: "#1a1a2e",
            }}
          >
            {DICE_FACES[faces[i] - 1]}
          </div>
        ))}
      </div>

      {/* Label */}
      {!isRolling && !thrown && (
        <div className="text-center" style={{ minHeight: 20 }}>
          {drag ? (
            <span className={`text-xs font-bold ${power > 75 ? "text-red-400" : "text-yellow-300"} animate-pulse`}>
              {power > 75 ? "🔥 Lepaskan!" : "↗ Geser lebih jauh..."}
            </span>
          ) : (
            <span className="text-gray-500 text-xs">👆 Sentuh &amp; gesek dadu untuk lempar</span>
          )}
        </div>
      )}
      {isRolling && (
        <div className="text-white text-xs font-semibold animate-pulse">🎲 Dadu menggelinding...</div>
      )}
    </div>
  );
}

function getBuildLabel(tile: Tile) {
  if (tile.landmark) return { icon: "🏛️", next: "MAX", cost: 0, isMax: true, label: "Landmark" };
  if (tile.hotel) {
    const cost = (tile.hotelCost ?? tile.houseCost ?? 0) * 2;
    return { icon: "🏨", next: "🏛️ Landmark", cost, isMax: false, label: "Hotel", needsLanding: !tile.landmarkReady };
  }
  const icons = ["🏚️","🏠","🏠🏠","🏠🏠🏠","🏠🏠🏠🏠"];
  const nexts = ["🏠 Rumah","🏠🏠 Rumah","🏢 Apartemen","🏢🏢 Apartemen","🏨 Hotel"];
  const labels = ["Kosong","Rumah","Rumah","Apartemen","Apartemen"];
  const h = tile.houses;
  return { icon: icons[h], next: nexts[h], cost: tile.houseCost ?? 0, isMax: false, label: labels[h], needsLanding: false };
}

export default function ActionSheet({
  gameState, currentPlayer, isRolling,
  onRoll, onBuy, onSkipBuy, onPayRent, onRebut, onPayTax,
  onCardAction, onJailAction, onJailContinue,
  onBuildHouse, onToggleBuilding, onOpenBuilding, onRestartGame,
}: ActionSheetProps) {
  const { phase, tiles, currentCard, pendingRent, winner, lastRoll } = gameState;
  const tile = tiles[currentPlayer.position];

  const buildableTiles = currentPlayer.properties
    .map(pid => tiles[pid])
    .filter(t => {
      if (t.type !== "property" || t.landmark) return false;
      const groupTiles = tiles.filter(gt => gt.group === t.group && gt.type === "property");
      return groupTiles.every(gt => gt.ownerId === currentPlayer.id);
    });

  const canBuildAnything = buildableTiles.some(t => {
    const { cost, needsLanding } = getBuildLabel(t);
    return !needsLanding && currentPlayer.money >= cost;
  });

  // ── Game Over ──
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

  // ── Lempar Dadu (hold-dice / rolling) — tampilkan DiceSwipe ala Line Get Rich ──
  if (phase === "hold-dice" || phase === "rolling") {
    return (
      <BottomSheet>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-xs text-gray-400 truncate">📍 {tile.name}</div>
              <div className="text-xs text-gray-500">Saldo: M{currentPlayer.money.toLocaleString()}</div>
            </div>
            {canBuildAnything && (
              <button
                onClick={onOpenBuilding}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-green-800 border border-green-600/50 text-green-200 active:scale-95 transition-all"
              >
                🏗️ Bangun
              </button>
            )}
          </div>
          <DiceSwipe onRoll={onRoll} isRolling={isRolling} lastRoll={lastRoll} />
        </div>
      </BottomSheet>
    );
  }

  // ── Penjara ──
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

  // ── Beli properti ──
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
            {ownsAll && tile.type === "property" && [1,2,3,4].map(h => {
              const total = basePrice + (tile.houseCost ?? 0) * h;
              const icons = ["🏠","🏠🏠","🏢","🏢🏢"];
              return (
                <SmallBtn key={h} onClick={() => onBuy(h)} color="bg-green-800" disabled={currentPlayer.money < total}>
                  {icons[h-1]} M{total}
                </SmallBtn>
              );
            })}
            {ownsAll && tile.type === "property" && (() => {
              const total = basePrice + (tile.houseCost ?? 0) * 4 + (tile.hotelCost ?? tile.houseCost ?? 0);
              return (
                <SmallBtn onClick={() => onBuy(5)} color="bg-red-800" disabled={currentPlayer.money < total}>
                  🏨 Hotel M{total}
                </SmallBtn>
              );
            })()}
          </div>
        </div>
      </BottomSheet>
    );
  }

  // ── Bayar sewa / rebut ──
  if (phase === "paying-rent" && pendingRent) {
    const owner = gameState.players.find(p => p.id === pendingRent.ownerId);
    const isLandmark = tile.landmark;
    const canRebut = !isLandmark && currentPlayer.money >= pendingRent.amount + (tile.price ?? 0);

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
                ⚔️ Rebut M{pendingRent.amount + (tile.price ?? 0)}
              </BigBtn>
            )}
          </div>
        </div>
      </BottomSheet>
    );
  }

  // ── Pajak ──
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

  // ── Kartu Kesempatan / Kas Umum ──
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

  // ── Panel Bangunan ──
  if (phase === "building") {
    const fromLanding = gameState.buildingFromLanding;
    return (
      <BottomSheet>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-white font-bold text-sm">🏗️ Upgrade Properti</span>
              {fromLanding && (
                <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-1.5 py-0.5 rounded-full">
                  Peluang Landmark!
                </span>
              )}
            </div>
            <SmallBtn onClick={onToggleBuilding} color="bg-gray-700">✓ Selesai</SmallBtn>
          </div>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
            {buildableTiles.map(t => {
              const { icon, next, cost, isMax, label, needsLanding } = getBuildLabel(t);
              const isLandmark = next.includes("Landmark");
              const isHotelReady = isLandmark && !needsLanding;
              const canAfford = isMax || needsLanding ? false : currentPlayer.money >= cost;

              return (
                <button
                  key={t.id}
                  onClick={() => !isMax && !needsLanding && canAfford && onBuildHouse(t.id)}
                  disabled={isMax || needsLanding || !canAfford}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95
                    ${isMax
                      ? "bg-yellow-900/40 border border-yellow-600/40 cursor-default opacity-70"
                      : needsLanding
                      ? "bg-gray-800/60 border border-gray-600/40 cursor-not-allowed opacity-50"
                      : isHotelReady
                      ? "bg-yellow-700/60 border border-yellow-500/60 hover:bg-yellow-600/60"
                      : !canAfford
                      ? "bg-gray-800/60 border border-gray-600/40 opacity-50 cursor-not-allowed"
                      : "bg-green-900/60 border border-green-600/40 hover:bg-green-800/60"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <div>
                      <div className={isMax ? "text-yellow-400" : needsLanding ? "text-gray-400" : "text-white"}>{t.name}</div>
                      {isMax && <div className="text-yellow-500 text-[9px]">🏛️ LANDMARK AKTIF · Sewa ×2 · Tidak bisa direbut</div>}
                      {needsLanding && <div className="text-gray-500 text-[9px]">⚠️ Harus mendarat di sini dulu</div>}
                      {!isMax && !needsLanding && <div className="text-gray-500 text-[9px]">{label} → {next}</div>}
                    </div>
                  </div>
                  {!isMax && !needsLanding && (
                    <span className={`flex-shrink-0 font-bold ${isHotelReady ? "text-yellow-300" : canAfford ? "text-green-300" : "text-gray-500"}`}>
                      +M{cost}
                    </span>
                  )}
                </button>
              );
            })}
            {buildableTiles.length === 0 && (
              <div className="text-gray-500 text-xs text-center py-3">
                Belum ada properti yang bisa di-upgrade
                <div className="text-gray-600 text-[10px] mt-1">Beli semua properti satu grup dulu</div>
              </div>
            )}
          </div>
        </div>
      </BottomSheet>
    );
  }

  // ── Moving ──
  if (phase === "moving") {
    return (
      <BottomSheet>
        <div className="text-center text-gray-400 text-sm py-1">
          <span className="animate-pulse">🚶 Pion melangkah...</span>
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

function BigBtn({ onClick, color, disabled = false, children }: {
  onClick: () => void; color: string; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${color} disabled:opacity-40 text-white font-bold text-sm px-4 rounded-xl active:scale-95 transition-all flex-shrink-0 flex items-center justify-center`}
      style={{ minHeight: 48, minWidth: 110 }}>
      {children}
    </button>
  );
}

function SmallBtn({ onClick, color, disabled = false, children }: {
  onClick: () => void; color: string; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${color} disabled:opacity-40 text-white font-bold text-xs px-3 rounded-xl active:scale-95 transition-all flex-shrink-0 flex items-center justify-center`}
      style={{ minHeight: 44 }}>
      {children}
    </button>
  );
}
