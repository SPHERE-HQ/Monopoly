import { useState, useEffect, useCallback } from "react";
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

export default function Game({ playerSetup, onRestart }: GameProps) {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(
      playerSetup.map(p => p.name),
      playerSetup.map(p => p.color)
    )
  );
  const [autoLand, setAutoLand] = useState(false);

  const currentPlayer: Player = getCurrentPlayer(gameState);

  // Auto-trigger landing after moving
  useEffect(() => {
    if (gameState.phase === "moving") {
      const timer = setTimeout(() => {
        setGameState(prev => handleLanding(prev));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.players[gameState.currentPlayerIndex]?.position]);

  const handleRoll = useCallback(() => {
    setGameState(prev => performRoll(prev));
  }, []);

  const handleBuy = useCallback(() => {
    setGameState(prev => buyProperty(prev));
  }, []);

  const handleSkipBuy = useCallback(() => {
    setGameState(prev => skipBuying(prev));
  }, []);

  const handlePayRent = useCallback(() => {
    setGameState(prev => payRent(prev));
  }, []);

  const handlePayTax = useCallback(() => {
    setGameState(prev => payTax(prev));
  }, []);

  const handleCardAction = useCallback(() => {
    setGameState(prev => applyCard(prev));
  }, []);

  const handleJailAction = useCallback((method: "card" | "pay" | "roll") => {
    if (method === "roll") {
      setGameState(prev => performRoll(prev));
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
    setGameState(prev => ({ ...prev, phase: prev.phase === "building" ? "rolling" : "building" }));
  }, []);

  const color = PLAYER_COLORS[currentPlayer.color];

  return (
    <div className="h-screen w-screen flex bg-gray-900 overflow-hidden">
      {/* Left panel - Players */}
      <div className="w-56 flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col p-3 gap-3 overflow-y-auto">
        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pemain</div>
        <PlayerPanel gameState={gameState} currentPlayer={currentPlayer} />
        <GameLog log={gameState.log} />
      </div>

      {/* Center - 3D Board */}
      <div className="flex-1 relative">
        <Board3D gameState={gameState} />

        {/* Message overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full max-w-xs text-center border border-white/10">
          {gameState.message}
        </div>

        {/* Dice overlay */}
        {gameState.lastRoll && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            {gameState.lastRoll.map((val, i) => (
              <div key={i} className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl font-black text-gray-900 shadow-xl border-2 border-gray-200">
                {["", "⚀","⚁","⚂","⚃","⚄","⚅"][val]}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right panel - Actions */}
      <div
        className="w-60 flex-shrink-0 border-l flex flex-col p-4"
        style={{ borderColor: `${color}44`, background: `linear-gradient(180deg, #1f2937 0%, #111827 100%)` }}
      >
        {/* Current player indicator */}
        <div className="mb-4 pb-4 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
            />
            <span className="text-white font-bold text-sm truncate">{currentPlayer.name}</span>
          </div>
          <div className="text-green-400 font-black text-xl">M{currentPlayer.money.toLocaleString()}</div>
          {currentPlayer.inJail && (
            <div className="text-xs text-orange-400 mt-1">🔒 Di penjara (giliran {currentPlayer.jailTurns}/3)</div>
          )}
        </div>

        {/* Actions */}
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

        {/* Phase indicator */}
        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-600 text-center">
            Fase: <span className="text-gray-400">{gameState.phase}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
