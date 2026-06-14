import { useState } from "react";
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
