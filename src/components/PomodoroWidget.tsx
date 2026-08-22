import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

export function PomodoroWidget() {
      const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
      const [isRunning, setIsRunning] = useState(false);

useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => {
      if (timer !== undefined) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-2 bg-black/20 p-3 rounded-2xl border border-zinc-700/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold opacity-60 tracking-wider flex items-center gap-1">
          <Timer size={14} /> FOCUS TIMER
        </span>
        <span role="timer" aria-label={`${formatTime(timeLeft)} remaining`} className="text-xs font-mono font-bold text-emerald-400">{formatTime(timeLeft)}</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <button 
          onClick={() => setIsRunning(!isRunning)} 
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1"
        >
          {isRunning ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Start Sprint</>}
        </button>
        <button 
          onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }} 
          aria-label="Reset focus timer"
          className="bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 p-2 rounded-xl text-xs transition"
          title="Reset"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}