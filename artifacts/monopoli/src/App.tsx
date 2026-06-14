import { useState, useEffect } from "react";
import Setup from "./pages/Setup";
import Game from "./pages/Game";
import { PlayerColor } from "./game/types";

interface PlayerSetup {
  name: string;
  color: PlayerColor;
}

export default function App() {
  const [playerSetup, setPlayerSetup] = useState<PlayerSetup[] | null>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!playerSetup) {
    return <Setup onStart={(players) => setPlayerSetup(players as PlayerSetup[])} />;
  }

  return (
    <Game
      playerSetup={playerSetup}
      onRestart={() => setPlayerSetup(null)}
    />
  );
}
