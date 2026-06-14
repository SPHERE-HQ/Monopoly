import { useState } from "react";
import { PlayerColor } from "../game/types";

interface SetupProps {
  onStart: (players: { name: string; color: PlayerColor }[]) => void;
}

const COLORS: { color: PlayerColor; label: string; hex: string; emoji: string }[] = [
  { color: "red",    label: "Merah",  hex: "#ef4444", emoji: "🔴" },
  { color: "blue",   label: "Biru",   hex: "#3b82f6", emoji: "🔵" },
  { color: "green",  label: "Hijau",  hex: "#22c55e", emoji: "🟢" },
  { color: "yellow", label: "Kuning", hex: "#eab308", emoji: "🟡" },
];

export default function Setup({ onStart }: SetupProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(["Pemain 1", "Pemain 2", "Pemain 3", "Pemain 4"]);

  const handleStart = () => {
    const players = names.slice(0, playerCount).map((name, i) => ({
      name: name.trim() || `Pemain ${i + 1}`,
      color: COLORS[i].color,
    }));
    onStart(players);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}
    >
      <div className="text-center mb-6">
        <h1 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400"
          style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)", lineHeight: 1 }}>
          MONOPOLI
        </h1>
        <p className="text-gray-400 mt-1" style={{ fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)" }}>
          🇮🇩 Edisi Indonesia · 3D · Lokal Multiplayer
        </p>
      </div>

      <div className="w-full" style={{ maxWidth: "min(420px, 90vw)" }}>
        <div className="bg-gray-800/80 backdrop-blur rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">

          <div className="p-4 border-b border-gray-700">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Jumlah Pemain</p>
            <div className="flex gap-2">
              {[2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setPlayerCount(n)}
                  className={`flex-1 rounded-xl font-bold text-xl transition-all active:scale-95 ${
                    playerCount === n
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                  style={{ minHeight: 52 }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-2.5">
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg border-2"
                  style={{ backgroundColor: `${COLORS[i].hex}22`, borderColor: `${COLORS[i].hex}88` }}
                >
                  {COLORS[i].emoji}
                </div>
                <input
                  type="text"
                  value={names[i]}
                  onChange={e => {
                    const n = [...names];
                    n[i] = e.target.value;
                    setNames(n);
                  }}
                  placeholder={`Pemain ${i + 1}`}
                  maxLength={16}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ height: 44 }}
                />
                <span
                  className="text-xs font-semibold flex-shrink-0 w-10 text-right"
                  style={{ color: COLORS[i].hex }}
                >
                  {COLORS[i].label}
                </span>
              </div>
            ))}
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={handleStart}
              className="w-full rounded-2xl font-black text-black transition-all active:scale-95 shadow-lg shadow-orange-500/30"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                fontSize: "clamp(1rem, 4vw, 1.25rem)",
                minHeight: 56,
              }}
            >
              🎲 MULAI BERMAIN!
            </button>
          </div>
        </div>

        <div className="mt-3 bg-gray-800/40 rounded-xl p-3 border border-gray-700/60">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">📋 Aturan Singkat</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {[
              "🎲 Lempar dadu & jelajahi papan",
              "🏘️ Beli properti kota Indonesia",
              "💰 Kenakan sewa ke pemain lain",
              "🏠 Bangun rumah & hotel",
              "🔒 Hindari penjara!",
              "🏆 Terakhir tidak bangkrut menang",
            ].map((r, i) => (
              <div key={i} className="text-[11px] text-gray-500">{r}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
