import { useState, useEffect, useRef } from 'react';
import { Command, Search, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStats: () => void;
  onOpenShortcuts: () => void;
  onOpenFind: () => void;
  onTogglePreferences: () => void;
  onToggleToolboxDrawer: () => void;
  onSetTheme: (theme: 'light' | 'coffee' | 'dark') => void;
  onSaveFile: () => void;
  onNewDocument: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenStats,
  onOpenShortcuts,
  onOpenFind,
  onTogglePreferences,
  onToggleToolboxDrawer,
  onSetTheme,
  onSaveFile,
  onNewDocument,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Draggable & LocalStorage Position State (Defaults to Top-Center)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const saved = localStorage.getItem('kanso_command_palette_pos');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return { x: window.innerWidth / 2 - 250, y: 80 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      const newPos = { x: newX, y: newY };
      setPosition(newPos);
      localStorage.setItem('kanso_command_palette_pos', JSON.stringify(newPos));
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

  // Define available commands
  const commands = [
    { id: 'find', label: 'Find & Quick Replace', category: 'Editing', shortcut: 'Cmd + F', action: () => { onOpenFind(); onClose(); } },
    { id: 'stats', label: 'Toggle Statistics & Limit Modal', category: 'Metrics', shortcut: 'Cmd + J', action: () => { onOpenStats(); onClose(); } },
    { id: 'shortcuts', label: 'Open Shortcut Cheat Sheet', category: 'Help', shortcut: '?', action: () => { onOpenShortcuts(); onClose(); } },
    { id: 'new_doc', label: 'Create New Document', category: 'Files', shortcut: 'Action', action: () => { onNewDocument(); onClose(); } },
    { id: 'save_file', label: 'Save Document as .txt', category: 'Files', shortcut: 'Action', action: () => { onSaveFile(); onClose(); } },
    { id: 'theme_dark', label: 'Switch to Dark Theme', category: 'Appearance', shortcut: 'Theme', action: () => { onSetTheme('dark'); onClose(); } },
    { id: 'theme_coffee', label: 'Switch to Coffee Theme', category: 'Appearance', shortcut: 'Theme', action: () => { onSetTheme('coffee'); onClose(); } },
    { id: 'theme_light', label: 'Switch to Light Theme', category: 'Appearance', shortcut: 'Theme', action: () => { onSetTheme('light'); onClose(); } },
    { id: 'toggle_prefs', label: 'Toggle Toolbox Sidebar', category: 'Interface', shortcut: 'Action', action: () => { onTogglePreferences(); onClose(); } },
    { id: 'customize_widgets', label: 'Customize Widget Drawer', category: 'Interface', shortcut: 'Action', action: () => { onToggleToolboxDrawer(); onClose(); } },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 select-none">
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="absolute pointer-events-auto w-[500px] bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/15 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden text-white animate-fadeIn"
        onKeyDown={handleKeyDown}
      >
        
        {/* Search Input Header */}
        <div className="relative flex items-center border-b border-white/15 px-4 py-3">
          <Search size={16} className="text-emerald-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search actions... (Esc to close)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent border-none outline-none text-xs text-white placeholder:text-zinc-500 font-medium"
          />
          <button onClick={onClose} className="p-1 rounded-full bg-white/5 hover:bg-white/15 transition cursor-pointer ml-2">
            <X size={14} />
          </button>
        </div>

        {/* Command List */}
        <div className="flex flex-col max-h-72 overflow-y-auto p-2 gap-1">
          {filteredCommands.length === 0 ? (
            <div className="text-zinc-500 text-center py-6 text-xs italic">No matching commands found.</div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition ${
                    isSelected ? 'bg-emerald-500 text-black font-medium shadow-md' : 'hover:bg-white/5 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Command size={14} className={isSelected ? 'text-black' : 'text-emerald-400 opacity-70'} />
                    <span>{cmd.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-black/20 text-black' : 'bg-white/5 opacity-50'}`}>
                      {cmd.category}
                    </span>
                    <kbd className={`px-2 py-0.5 rounded font-mono text-[10px] border ${isSelected ? 'bg-black/20 border-black/20 text-black' : 'bg-black/40 border-white/10 opacity-70'}`}>
                      {cmd.shortcut}
                    </kbd>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="border-t border-white/10 px-4 py-2 text-[10px] opacity-40 font-mono flex items-center justify-between">
          <span>Use ↑↓ arrows to navigate</span>
          <span>Press Enter to execute</span>
        </div>

      </div>
    </div>
  );
}