import { useState, useRef } from 'react';
import { StickyNote } from 'lucide-react';

export function ScratchpadWidget({ widgetClass = 'bg-white/5 border border-white/10', inputClass = 'bg-black/30 border border-white/10' }: { widgetClass?: string; inputClass?: string }) {
  const [scratchpad, setScratchpad] = useState('');
  const [height, setHeight] = useState(80);
  const startY = useRef(0);
  const startH = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startY.current = e.clientY;
    startH.current = height;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientY - startY.current;
      setHeight(Math.max(60, startH.current + delta));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className={`flex flex-col gap-2 ${widgetClass} p-3 rounded-2xl`}>
      <span className="text-[10px] font-semibold tracking-wider opacity-50 uppercase flex items-center gap-1">
        <StickyNote size={12} /> Scratchpad
      </span>
      <div className="relative">
        <textarea
          value={scratchpad}
          onChange={(e) => setScratchpad(e.target.value)}
          placeholder="Quick notes, ideas, or citations..."
          style={{ height }}
          className={`w-full ${inputClass} rounded-xl p-2.5 text-xs outline-none resize-none placeholder:text-zinc-500/60`}
        />
        <div
          onMouseDown={onMouseDown}
          className="absolute bottom-1 right-1 w-4 h-4 cursor-ns-resize opacity-40 hover:opacity-80 transition"
        >
          <svg viewBox="0 0 10 10" fill="white">
            <line x1="2" y1="8" x2="8" y2="2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="5" y1="8" x2="8" y2="5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
