import { useState, useEffect } from "react";
import Setup from "./pages/Setup";
import Game from "./pages/Game";
import { PlayerColor } from "./game/types";

interface PlayerSetup {
  name: string;
  color: PlayerColor;
}

export default function App() {
  const [players, setPlayers] = useState<PlayerSetup[] | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const lockLandscape = async () => {
      try {
        if (screen.orientation && typeof (screen.orientation as any).lock === "function") {
          await (screen.orientation as any).lock("landscape");
        }
      } catch {
        // tidak didukung di desktop atau browser tertentu — diabaikan
      }
    };
    lockLandscape();
  }, []);

  if (!players) {
    return (
      <Setup
        onStart={(p) => setPlayers(p as PlayerSetup[])}
      />
    );
  }

  return (
    <Game
      key={key}
      playerSetup={players}
      onRestart={() => {
        setPlayers(null);
        setKey(k => k + 1);
      }}
    />
  );
}
