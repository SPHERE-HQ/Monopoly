import { useState, useEffect, useCallback, useRef } from "react";
import { GameState, Player } from "../game/types";
import {
  createInitialState, getCurrentPlayer, handleLanding, performRoll,
  buyProperty, skipBuying, payRent, rebutProperty, payTax, applyCard,
  releaseFromJail, buildHouse,
} from "../game/engine";
import Board3D from "../components/Board3D";
import TopHUD from "../components/TopHUD";
import ActionSheet from "../components/ActionSheet";
import PlayerOverlay from "../components/PlayerOverlay";
import LogOverlay from "../components/LogOverlay";
import { PLAYER_COLORS } from "../game/board";

interface GameProps {
  playerSetup: { name: string; color: string }[];
  onRestart: () => void;
}

const ROLL_ANIM_MS = 900;

export default function Game({ playerSetup, onRestart }: GameProps) {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(
      playerSetup.map(p => p.name),
      playerSetup.map(p => p.color),
    ),
  );
  const [isRolling, setIsRolling] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPlayer: Player = getCurrentPlayer(gameState);

  useEffect(() => {
    if (gameState.phase !== "moving") return;
    const t = setTimeout(() => setGameState(prev => handleLanding(prev)), 700);
    return () => clearTimeout(t);
  }, [gameState.phase, gameState.players[gameState.currentPlayerIndex]?.position]);

  const triggerRoll = useCallback(() => {
    setIsRolling(true);
    if (rollTimer.current) clearTimeout(rollTimer.current);
    rollTimer.current = setTimeout(() => {
      setIsRolling(false);
      setGameState(prev => performRoll(prev));
    }, ROLL_ANIM_MS);
  }, []);

  const handleJailAction = useCallback((method: "card" | "pay" | "roll") => {
    if (method === "roll") triggerRoll();
    else setGameState(prev => releaseFromJail(prev, method));
  }, [triggerRoll]);

  const handleToggleBuilding = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: prev.phase === "building" ? "rolling" : "building",
    }));
  }, []);

  const color = PLAYER_COLORS[currentPlayer.color];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950 touch-none select-none">

      <div className="absolute inset-0">
        <Board3D gameState={gameState} isRolling={isRolling} />
      </div>

      <TopHUD
        gameState={gameState}
        currentPlayer={currentPlayer}
        onTogglePlayers={() => { setShowPlayers(v => !v); setShowLog(false); }}
        onToggleLog={() => { setShowLog(v => !v); setShowPlayers(false); }}
      />

      <div className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        style={{ top: 52 }}>
        <div
          className="text-white text-xs font-semibold px-4 py-1.5 rounded-full text-center border border-white/10 max-w-[70vw] truncate"
          style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
        >
          {isRolling ? "🎲 Melempar dadu..." : gameState.message}
        </div>
      </div>

      {gameState.lastRoll && !isRolling && gameState.phase !== "moving" && (
        <div className="absolute left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-none"
          style={{ bottom: 78 }}>
          {gameState.lastRoll.map((val, i) => (
            <div key={i}
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl font-black text-gray-900 shadow-xl select-none"
              style={{ animation: "diceSettle .3s ease-out" }}>
              {["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][val]}
            </div>
          ))}
          <div className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-xl flex items-center justify-center text-sm font-bold text-yellow-300">
            ={gameState.lastRoll[0] + gameState.lastRoll[1]}
          </div>
        </div>
      )}

      {isRolling && (
        <div className="absolute left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-none"
          style={{ bottom: 78 }}>
          {[0, 1].map(i => (
            <div key={i}
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl font-black text-gray-900 border-2 border-yellow-400 select-none"
              style={{ animation: "diceRoll .12s ease-in-out infinite" }}>
              {["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      <div
        className="absolute left-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full pointer-events-none"
        style={{
          bottom: 78,
          background: `${color}22`,
          border: `1px solid ${color}66`,
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
        <span className="text-white font-bold text-xs">{currentPlayer.name}</span>
        <span className="text-green-400 font-black text-xs">M{currentPlayer.money.toLocaleString()}</span>
        {currentPlayer.inJail && <span className="text-[10px]">🔒</span>}
      </div>

      <ActionSheet
        gameState={gameState}
        currentPlayer={currentPlayer}
        isRolling={isRolling}
        onRoll={triggerRoll}
        onBuy={(h) => setGameState(prev => buyProperty(prev, h))}
        onSkipBuy={() => setGameState(prev => skipBuying(prev))}
        onPayRent={() => setGameState(prev => payRent(prev))}
        onRebut={() => setGameState(prev => rebutProperty(prev))}
        onPayTax={() => setGameState(prev => payTax(prev))}
        onCardAction={() => setGameState(prev => applyCard(prev))}
        onJailAction={handleJailAction}
        onJailContinue={() => setGameState(prev => ({ ...prev, phase: "rolling" }))}
        onBuildHouse={id => setGameState(prev => buildHouse(prev, id))}
        onToggleBuilding={handleToggleBuilding}
        onRestartGame={onRestart}
      />

      {showPlayers && (
        <PlayerOverlay
          gameState={gameState}
          currentPlayer={currentPlayer}
          onClose={() => setShowPlayers(false)}
        />
      )}
      {showLog && (
        <LogOverlay
          log={gameState.log}
          onClose={() => setShowLog(false)}
        />
      )}
    </div>
  );
}
