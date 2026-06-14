import { GameState, Player } from "../game/types";
import { PLAYER_COLORS } from "../game/board";

interface TopHUDProps {
  gameState: GameState;
  currentPlayer: Player;
  onToggleLog: () => void;
  onTogglePlayers: () => void;
}

export default function TopHUD({ gameState, currentPlayer, onToggleLog, onTogglePlayers }: TopHUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-1.5 px-2 py-1.5"
      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)" }}>

      <div className="flex gap-1.5 flex-1 min-w-0">
        {gameState.players.map(player => {
          const color = PLAYER_COLORS[player.color];
          const isCurrent = player.id === currentPlayer.id;
          return (
            <div
              key={player.id}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                player.bankrupt
                  ? "opacity-30 bg-gray-800"
                  : isCurrent
                  ? "ring-2 ring-yellow-400 scale-105"
                  : "opacity-70"
              }`}
              style={{
                background: player.bankrupt ? undefined : `${color}22`,
                borderColor: color,
                border: `1px solid ${color}66`,
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color, boxShadow: isCurrent ? `0 0 6px ${color}` : "none" }}
              />
              <span className="text-white truncate max-w-[48px]">{player.name.split(" ")[0]}</span>
              <span style={{ color: player.bankrupt ? "#666" : "#4ade80" }} className="font-black">
                {player.bankrupt ? "💀" : `${Math.floor(player.money / 1000) > 0 ? Math.floor(player.money / 1000) + "k" : player.money}`}
              </span>
              {player.inJail && !player.bankrupt && <span className="text-[10px]">🔒</span>}
              {isCurrent && !player.bankrupt && (
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={onTogglePlayers}
          className="w-8 h-8 rounded-full bg-gray-800/80 border border-gray-600 flex items-center justify-center text-sm active:scale-95"
          title="Pemain"
        >
          👥
        </button>
        <button
          onClick={onToggleLog}
          className="w-8 h-8 rounded-full bg-gray-800/80 border border-gray-600 flex items-center justify-center text-sm active:scale-95"
          title="Log"
        >
          📋
        </button>
      </div>
    </div>
  );
}
