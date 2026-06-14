import { useState } from "react";
import { PlayerColor } from "../game/types";

interface SetupProps {
  onStart: (players: { name: string; color: PlayerColor }[]) => void;
}

const COLORS: { color: PlayerColor; label: string; hex: string }[] = [
  { color: "red",    label: "Merah",   hex: "#ef4444" },
  { color: "blue",   label: "Biru",    hex: "#3b82f6" },
  { color: "green",  label: "Hijau",   hex: "#22c55e" },
  { color: "yellow", label: "Kuning",  hex: "#eab308" },
];

export default function Setup({ onStart }: SetupProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(["Pemain 1", "Pemain 2", "Pemain 3", "Pemain 4"]);

  const handleStart = () => {
    const players = names.slice(0, playerCount).map((name, i) => ({
      name: name || `Pemain ${i + 1}`,
      color: COLORS[i].color,
    }));
    onStart(players);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
            MONOPOLI
          </h1>
          <p className="text-gray-400 text-sm">Game Papan 3D • Lokal Multiplayer</p>
        </div>

        <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 border border-gray-700 shadow-2xl">
          {/* Player count */}
          <div className="mb-6">
            <label className="text-gray-300 text-sm font-semibold block mb-3">Jumlah Pemain</label>
            <div className="flex gap-2">
              {[2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setPlayerCount(n)}
                  className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                    playerCount === n
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Player names */}
          <div className="space-y-3 mb-6">
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white/20"
                  style={{ backgroundColor: COLORS[i].hex }}
                />
                <input
                  type="text"
                  value={names[i]}
                  onChange={e => {
                    const newNames = [...names];
                    newNames[i] = e.target.value;
                    setNames(newNames);
                  }}
                  placeholder={`Pemain ${i + 1}`}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="text-xs text-gray-500">{COLORS[i].label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-xl rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/30"
          >
            🎲 MULAI BERMAIN!
          </button>
        </div>

        {/* Rules summary */}
        <div className="mt-4 bg-gray-800/40 rounded-xl p-4 border border-gray-700">
          <div className="text-xs text-gray-400 font-semibold mb-2">📋 ATURAN SINGKAT</div>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Lempar dadu & keliling papan</li>
            <li>• Beli properti & kenakan sewa</li>
            <li>• Bangun rumah & hotel untuk sewa lebih tinggi</li>
            <li>• Pemain terakhir yang tidak bangkrut menang!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
