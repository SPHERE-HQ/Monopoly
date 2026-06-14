import { GameState, Player } from "../game/types";
import { PLAYER_COLORS } from "../game/board";
import { BOARD_TILES } from "../game/board";

interface PlayerPanelProps {
  gameState: GameState;
  currentPlayer: Player;
}

export default function PlayerPanel({ gameState, currentPlayer }: PlayerPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      {gameState.players.map(player => {
        const isCurrent = player.id === currentPlayer.id;
        const color = PLAYER_COLORS[player.color];
        return (
          <div
            key={player.id}
            className={`rounded-lg p-3 border-2 transition-all ${
              player.bankrupt
                ? "opacity-40 border-gray-600 bg-gray-800"
                : isCurrent
                ? "border-yellow-400 bg-gray-700 shadow-lg shadow-yellow-400/20"
                : "border-gray-600 bg-gray-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: color, boxShadow: isCurrent ? `0 0 8px ${color}` : "none" }}
              />
              <span className={`font-bold text-sm truncate ${isCurrent ? "text-yellow-300" : "text-white"}`}>
                {player.name}
              </span>
              {isCurrent && !player.bankrupt && (
                <span className="ml-auto text-xs bg-yellow-400 text-black px-1.5 py-0.5 rounded font-bold">GILIRAN</span>
              )}
              {player.bankrupt && (
                <span className="ml-auto text-xs bg-red-700 text-white px-1.5 py-0.5 rounded font-bold">BANGKRUT</span>
              )}
              {player.inJail && !player.bankrupt && (
                <span className="ml-auto text-xs bg-orange-600 text-white px-1.5 py-0.5 rounded">🔒</span>
              )}
            </div>

            <div className="text-green-400 font-bold text-base">
              M{player.money.toLocaleString()}
            </div>

            {player.getOutOfJailCards > 0 && (
              <div className="text-xs text-blue-300 mt-1">
                🃏 Kartu Bebas: {player.getOutOfJailCards}x
              </div>
            )}

            {player.properties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {player.properties.map(pid => {
                  const tile = BOARD_TILES[pid];
                  const bgColor = {
                    "brown": "#8B4513", "light-blue": "#87CEEB", "pink": "#FF69B4",
                    "orange": "#FFA500", "red": "#FF0000", "yellow": "#FFD700",
                    "green": "#228B22", "dark-blue": "#00008B",
                    "railroad": "#444", "utility": "#888"
                  }[tile.group] || "#666";
                  return (
                    <div
                      key={pid}
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: bgColor }}
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
  );
}
