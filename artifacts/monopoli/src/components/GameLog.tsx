import { useEffect, useRef } from "react";

interface GameLogProps {
  log: string[];
}

export default function GameLog({ log }: GameLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  return (
    <div className="bg-gray-900 rounded-lg p-2 h-32 overflow-y-auto border border-gray-700">
      <div className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Log Permainan</div>
      {log.slice(-20).map((entry, i) => (
        <div key={i} className="text-xs text-gray-300 py-0.5 border-b border-gray-800 last:border-0">
          {entry}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
