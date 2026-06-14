interface LogOverlayProps {
  log: string[];
  onClose: () => void;
}

export default function LogOverlay({ log, onClose }: LogOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-3 w-[90vw] max-w-sm max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2 flex-shrink-0">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">📋 Log Permainan</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xs">✕</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {log.slice().reverse().map((entry, i) => (
            <div key={i} className={`text-xs py-1.5 border-b border-gray-800 last:border-0 ${i === 0 ? "text-yellow-300 font-semibold" : "text-gray-400"}`}>
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
