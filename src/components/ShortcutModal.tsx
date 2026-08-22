import { useEffect, useState, useRef } from 'react';
import { Command, X, Search, BarChart2, Sparkles, GripHorizontal } from 'lucide-react';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface ShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutModal({ isOpen, onClose }: ShortcutModalProps) {
  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen);
  // Draggable & LocalStorage Position State (Defaults to Center)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const saved = localStorage.getItem('kanso_shortcut_modal_pos');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return { x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 200 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMoveKeyDown = (event: React.KeyboardEvent) => {
    const offsets: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -10, y: 0 },
      ArrowRight: { x: 10, y: 0 },
      ArrowUp: { x: 0, y: -10 },
      ArrowDown: { x: 0, y: 10 },
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    setPosition((current) => ({ x: current.x + offset.x, y: current.y + offset.y }));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      const newPos = { x: newX, y: newY };
      setPosition(newPos);
      localStorage.setItem('kanso_shortcut_modal_pos', JSON.stringify(newPos));
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 select-none">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-modal-title"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="absolute pointer-events-auto w-[calc(100vw-2rem)] max-w-125 bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/15 p-6 rounded-4x1 shadow-2xl flex flex-col gap-5 text-white animate-fadeIn"
      >
        
        {/* Draggable Header */}
        <div 
          role="button"
          tabIndex={0}
          aria-label="Move shortcut dialog with arrow keys"
          className="flex items-center justify-between border-b border-white/15 pb-3 cursor-grab"
          onMouseDown={handleMouseDown}
          onKeyDown={handleMoveKeyDown}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal size={14} className="opacity-40" />
            <Command size={16} className="text-emerald-400" />
            <span id="shortcut-modal-title" className="font-semibold text-xs tracking-wider uppercase opacity-90">Kanso Shortcut Cheat Sheet</span>
          </div>
          <button onClick={onClose} aria-label="Close shortcut cheat sheet" title="Close" className="p-1 rounded-full bg-white/5 hover:bg-white/15 transition cursor-pointer">
            <X size={14} />
          </button>
        </div>

        {/* Shortcut Categories */}
        <div className="flex flex-col gap-4 max-h-90 overflow-y-auto pr-1 text-xs">
          
          {/* Section: Find & Replace */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
              <Search size={12} /> Find & Replace Inspector
            </span>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="opacity-70">Open Find & Replace</span>
                <kbd className="px-2 py-0.5 bg-black/40 border border-white/10 rounded-lg font-mono text-[10px]">Cmd + F</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Close Modal</span>
                <kbd className="px-2 py-0.5 bg-black/40 border border-white/10 rounded-lg font-mono text-[10px]">Esc</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Next Match / Jump Down</span>
                <kbd className="px-2 py-0.5 bg-black/40 border border-white/10 rounded-lg font-mono text-[10px]">Enter / ↓</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Previous Match / Jump Up</span>
                <kbd className="px-2 py-0.5 bg-black/40 border border-white/10 rounded-lg font-mono text-[10px]">Shift + Enter / ↑</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Replace All</span>
                <kbd className="px-2 py-0.5 bg-black/40 border border-white/10 rounded-lg font-mono text-[10px]">Cmd + Enter</kbd>
              </div>
            </div>
          </div>

          {/* Section: Metrics & Editor */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
              <BarChart2 size={12} /> Statistics & Limits
            </span>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="opacity-70">Toggle Metrics & Limit Modal</span>
                <kbd className="px-2 py-0.5 bg-black/40 border border-white/10 rounded-lg font-mono text-[10px]">Cmd + J</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Open Shortcut Cheat Sheet</span>
                <kbd className="px-2 py-0.5 bg-black/40 border border-white/10 rounded-lg font-mono text-[10px]">?</kbd>
              </div>
            </div>
          </div>

          {/* Section: Power Features */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
              <Sparkles size={12} /> Writer Power Tools
            </span>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="opacity-70">Replacement History & Revert</span>
                <span className="font-mono text-[10px] opacity-70">History Button top-right</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Draggable Floating Panels</span>
                <span className="font-mono text-[10px] opacity-70">Click & Drag Header Bar</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">LocalStorage Memory Position</span>
                <span className="font-mono text-[10px] opacity-70">Automatic Persistence</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="border-t border-white/10 pt-3 text-[10px] opacity-50 text-center font-mono">
          Press Esc anytime to close this cheat sheet.
        </div>

      </div>
    </div>
  );
}