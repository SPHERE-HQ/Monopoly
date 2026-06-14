import { GameState, Player } from "../game/types";
import { PLAYER_COLORS, BOARD_TILES } from "../game/board";

interface PlayerOverlayProps {
  gameState: GameState;
  currentPlayer: Player;
  onClose: () => void;
}

const GROUP_DOT: Record<string, string> = {
  "brown": "#8B4513", "light-blue": "#87CEEB", "pink": "#FF69B4",
  "orange": "#FFA500", "red": "#FF0000", "yellow": "#FFD700",
  "green": "#228B22", "dark-blue": "#00008B",
  "railroad": "#444", "utility": "#888",
};

export default function PlayerOverlay({ gameState, currentPlayer, onClose }: PlayerOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-3 w-[90vw] max-w-sm max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">Status Pemain</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xs">✕</button>
        </div>

        <div className="space-y-2">
          {gameState.players.map(player => {
            const isCurrent = player.id === currentPlayer.id;
            const color = PLAYER_COLORS[player.color];
            return (
              <div
                key={player.id}
                className={`rounded-xl p-3 border transition-all ${
                  player.bankrupt ? "opacity-40 border-gray-700 bg-gray-800/50"
                  : isCurrent ? "border-yellow-400/60 bg-yellow-400/5"
                  : "border-gray-700 bg-gray-800/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color, boxShadow: isCurrent ? `0 0 8px ${color}` : "none" }} />
                  <span className={`font-bold text-sm flex-1 ${isCurrent ? "text-yellow-300" : "text-white"}`}>
                    {player.name}
                  </span>
                  {isCurrent && !player.bankrupt && (
                    <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.5 rounded font-bold">GILIRAN</span>
                  )}
                  {player.bankrupt && (
                    <span className="text-[10px] bg-red-800 text-white px-1.5 py-0.5 rounded font-bold">BANGKRUT</span>
                  )}
                  {player.inJail && !player.bankrupt && (
                    <span className="text-xs">🔒</span>
                  )}
                </div>
                <div className="text-green-400 font-black text-lg">
                  M{player.money.toLocaleString()}
                </div>
                {player.getOutOfJailCards > 0 && (
                  <div className="text-[11px] text-blue-300 mt-0.5">🃏 Bebas Penjara ×{player.getOutOfJailCards}</div>
                )}
                {player.properties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {player.properties.map(pid => {
                      const tile = BOARD_TILES[pid];
                      return (
                        <div key={pid} className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: GROUP_DOT[tile.group] ?? "#666" }}
                          title={tile.name}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
