import { useState, useEffect, useCallback, useRef } from "react";
import { GameState, Player } from "../game/types";
import {
  createInitialState, getCurrentPlayer, handleLanding, performRoll,
  buyProperty, skipBuying, payRent, payTax, applyCard,
  releaseFromJail, buildHouse
} from "../game/engine";
import Board3D from "../components/Board3D";
import PlayerPanel from "../components/PlayerPanel";
import ActionPanel from "../components/ActionPanel";
import GameLog from "../components/GameLog";
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
      playerSetup.map(p => p.color)
    )
  );
  const [isRolling, setIsRolling] = useState(false);
  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPlayer: Player = getCurrentPlayer(gameState);

  // Auto-trigger landing after "moving" phase
  useEffect(() => {
    if (gameState.phase === "moving") {
      const timer = setTimeout(() => {
        setGameState(prev => handleLanding(prev));
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.players[gameState.currentPlayerIndex]?.position]);

  const handleRoll = useCallback(() => {
    // Start rolling animation, then apply the roll result after ROLL_ANIM_MS
    setIsRolling(true);
    if (rollTimerRef.current) clearTimeout(rollTimerRef.current);
    rollTimerRef.current = setTimeout(() => {
      setIsRolling(false);
      setGameState(prev => performRoll(prev));
    }, ROLL_ANIM_MS);
  }, []);

  const handleBuy = useCallback(() => setGameState(prev => buyProperty(prev)), []);
  const handleSkipBuy = useCallback(() => setGameState(prev => skipBuying(prev)), []);
  const handlePayRent = useCallback(() => setGameState(prev => payRent(prev)), []);
  const handlePayTax = useCallback(() => setGameState(prev => payTax(prev)), []);
  const handleCardAction = useCallback(() => setGameState(prev => applyCard(prev)), []);

  const handleJailAction = useCallback((method: "card" | "pay" | "roll") => {
    if (method === "roll") {
      setIsRolling(true);
      if (rollTimerRef.current) clearTimeout(rollTimerRef.current);
      rollTimerRef.current = setTimeout(() => {
        setIsRolling(false);
        setGameState(prev => performRoll(prev));
      }, ROLL_ANIM_MS);
    } else {
      setGameState(prev => releaseFromJail(prev, method));
    }
  }, []);

  const handleJailContinue = useCallback(() => {
    setGameState(prev => ({ ...prev, phase: "rolling" }));
  }, []);

  const handleBuildHouse = useCallback((tileId: number) => {
    setGameState(prev => buildHouse(prev, tileId));
  }, []);

  const handleEndBuilding = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: prev.phase === "building" ? "rolling" : "building"
    }));
  }, []);

  const color = PLAYER_COLORS[currentPlayer.color];

  return (
    <div className="h-screen w-screen flex bg-gray-900 overflow-hidden landscape-only">
      {/* Left panel */}
      <div className="w-52 flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col p-2 gap-2 overflow-y-auto">
        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider px-1">Pemain</div>
        <PlayerPanel gameState={gameState} currentPlayer={currentPlayer} />
        <GameLog log={gameState.log} />
      </div>

      {/* Center — 3D Board */}
      <div className="flex-1 relative min-w-0">
        <Board3D
          gameState={gameState}
          isRolling={isRolling}
          onTileClick={undefined}
        />

        {/* Floating message */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full max-w-[280px] text-center border border-white/10 pointer-events-none">
          {isRolling ? "🎲 Melempar dadu..." : gameState.message}
        </div>

        {/* Dice emoji overlay at bottom */}
        {gameState.lastRoll && !isRolling && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
            {gameState.lastRoll.map((val, i) => (
              <div
                key={i}
                className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-xl font-black text-gray-900 shadow-xl border-2 border-gray-200 select-none"
                style={{ animation: "diceSettle 0.3s ease-out" }}
              >
                {["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][val]}
              </div>
            ))}
            <div className="w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center text-sm font-bold text-yellow-300 border-2 border-gray-600">
              ={gameState.lastRoll[0] + gameState.lastRoll[1]}
            </div>
          </div>
        )}

        {/* Rolling animation overlay */}
        {isRolling && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
            {[0, 1].map(i => (
              <div
                key={i}
                className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-xl font-black text-gray-900 shadow-xl border-2 border-yellow-400 select-none"
                style={{ animation: `diceRoll 0.15s ease-in-out infinite` }}
              >
                {["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][Math.floor(Math.random() * 6)]}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right panel */}
      <div
        className="w-56 flex-shrink-0 border-l flex flex-col p-3"
        style={{
          borderColor: `${color}44`,
          background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)"
        }}
      >
        {/* Current player */}
        <div className="mb-3 pb-3 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
            />
            <span className="text-white font-bold text-sm truncate">{currentPlayer.name}</span>
          </div>
          <div className="text-green-400 font-black text-lg">M{currentPlayer.money.toLocaleString()}</div>
          {currentPlayer.inJail && (
            <div className="text-xs text-orange-400 mt-0.5">
              🔒 Penjara ({currentPlayer.jailTurns}/3)
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-1 overflow-y-auto">
          <ActionPanel
            gameState={gameState}
            currentPlayer={currentPlayer}
            onRoll={handleRoll}
            onBuy={handleBuy}
            onSkipBuy={handleSkipBuy}
            onPayRent={handlePayRent}
            onPayTax={handlePayTax}
            onCardAction={handleCardAction}
            onJailAction={handleJailAction}
            onJailContinue={handleJailContinue}
            onBuildHouse={handleBuildHouse}
            onEndBuilding={handleEndBuilding}
            onRestartGame={onRestart}
          />
        </div>

        <div className="pt-2 border-t border-gray-700 mt-2">
          <div className="text-xs text-gray-600 text-center">
            <span className="text-gray-500">{gameState.phase}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
