import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Search, Replace, X, ArrowUp, ArrowDown, CaseSensitive, WholeWord, ArrowRight, CheckCheck, GripHorizontal, History, Undo2 } from 'lucide-react';
import { useDialogFocus } from '../hooks/useDialogFocus';

// Props for the FindReplaceModal component
interface FindReplaceModalProps {
  content: string;
  onUpdate: (newContent: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onSearchChange?: (query: string, activeIdx: number) => void;
  initialQuery?: string;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}

// Interface for a single replace history item
interface ReplaceHistoryItem {
  id: string;
  find: string;
  replace: string;
  previousContent: string;
  timestamp: string;
}

// Main Find & Replace Modal Component
export function FindReplaceModal({ content, onUpdate, isOpen, onClose, onSearchChange, initialQuery, textareaRef }: FindReplaceModalProps) {
  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // <--- Declared properly here at the top!
  const taRef = textareaRef as RefObject<HTMLTextAreaElement> | undefined;

  // Replace History State
  const [history, setHistory] = useState<ReplaceHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Draggable & LocalStorage Position State
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const saved = localStorage.getItem('kanso_find_modal_pos');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return { x: window.innerWidth / 2 - 230, y: 24 };
  });

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const findInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-fill initial query when opened
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setFindText(initialQuery);
      }
      setTimeout(() => findInputRef.current?.focus(), 50);
    } else {
      setFindText('');
      setReplaceText('');
      setCurrentIndex(0);
    }
  }, [isOpen, initialQuery]);

  // Notify parent of search query changes
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(findText, currentIndex);
    }
  }, [findText, currentIndex, onSearchChange]);

  // Global shortcut listener (Escape to close)
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

  // Handle mouse down to initiate dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // Handle dragging and update position in localStorage
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      const newPos = { x: newX, y: newY };
      setPosition(newPos);
      localStorage.setItem('kanso_find_modal_pos', JSON.stringify(newPos));
    };

    // Handle mouse up to stop dragging
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

  // Function to get all matches of the find text in the content
  const getMatches = () => {
    if (!findText) return [];
    try {
      const flags = matchCase ? 'g' : 'gi';
      let escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (matchWholeWord) escaped = `\\b${escaped}\\b`;
      const regex = new RegExp(escaped, flags);
      return Array.from(content.matchAll(regex));
    } catch {
      return [];
    }
  };

  // Get matches and count
  const matches = getMatches();
  const matchCount = matches.length;

  // Scroll to the currently selected match in the textarea
  const scrollToMatch = (idx: number) => {
    const el = taRef?.current;
    if (!el || !matches[idx]) return;
    const match = matches[idx];
    const start = match.index ?? 0;
    const end = start + match[0].length;
    el.focus();
    el.setSelectionRange(start, end);
    const linesBefore = content.slice(0, start).split('\n').length - 1;
    const lineHeight = el.scrollHeight / (content.split('\n').length || 1);
    const targetScroll = Math.max(0, linesBefore * lineHeight - el.clientHeight / 2);
    el.scrollTop = targetScroll;
  };

  // Handle next match navigation
  const handleNextMatch = () => {
    if (matchCount === 0) return;
    const next = (currentIndex + 1) % matchCount;
    setCurrentIndex(next);
    scrollToMatch(next);
  };

  // Handle previous match navigation
  const handlePrevMatch = () => {
    if (matchCount === 0) return;
    const prev = (currentIndex - 1 + matchCount) % matchCount;
    setCurrentIndex(prev);
    scrollToMatch(prev);
  };

  // Record history when a replacement is made
  const recordHistory = (oldContent: string, find: string, replace: string) => {
    const newItem: ReplaceHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      find,
      replace,
      previousContent: oldContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 9)]);
  };

  // Handle single replacement
  const handleReplaceSingle = () => {
    if (!findText || matchCount === 0) return;
    try {
      const oldContent = content;
      const flags = matchCase ? '' : 'i';
      let escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (matchWholeWord) escaped = `\\b${escaped}\\b`;
      const regex = new RegExp(escaped, flags);
      const updated = content.replace(regex, replaceText);
      
      recordHistory(oldContent, findText, replaceText);
      onUpdate(updated);

      if (currentIndex >= matchCount - 1 && matchCount > 1) {
        setCurrentIndex(matchCount - 2);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle replace all
  const handleReplaceAll = () => {
    if (!findText) return;
    const oldContent = content;
    let updated = '';

    if (matchCase) {
      const parts = content.split(findText);
      updated = parts.join(replaceText);
    } else {
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      updated = content.replace(regex, replaceText);
    }

    recordHistory(oldContent, findText, replaceText);
    onUpdate(updated);
    setCurrentIndex(0);
  };

  // Revert specific history state
  const handleRevert = (item: ReplaceHistoryItem) => {
    onUpdate(item.previousContent);
    setHistory((prev) => prev.filter((h) => h.id !== item.id));
  };

  // Handle keyboard navigation in the find input
  const handleFindKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (e.shiftKey && e.key === 'Enter') {
        handlePrevMatch();
      } else {
        handleNextMatch();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handlePrevMatch();
    }
  };

  // Handle Cmd/Ctrl + Enter for Replace All
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleReplaceAll();
    }
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 select-none"
      onKeyDown={handleModalKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="find-replace-title"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="absolute pointer-events-auto w-[calc(100vw-2rem)] max-w-115 bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/15 p-5 rounded-4x1 shadow-2xl flex flex-col gap-4 text-white animate-fadeIn"
      >
        
        {/* Draggable Header */}
        <div 
          role="button"
          tabIndex={0}
          aria-label="Move find and replace dialog with arrow keys"
          className="flex items-center justify-between border-b border-white/15 pb-3 cursor-grab"
          onMouseDown={handleMouseDown}
          onKeyDown={handleMoveKeyDown}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal size={14} className="opacity-40" />
            <Search size={14} className="text-emerald-400" />
            <span id="find-replace-title" className="font-semibold text-xs tracking-wider uppercase opacity-90">Find & Quick Replace</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              aria-label="Toggle replacement history"
              aria-pressed={showHistory}
              className={`p-1.5 rounded-lg transition text-xs flex items-center gap-1 cursor-pointer ${showHistory ? 'bg-emerald-500 text-black font-semibold' : 'bg-white/5 hover:bg-white/15 opacity-70'}`}
              title="Toggle Replace History"
            >
              <History size={14} />
              <span className="text-[10px] font-mono">{history.length}</span>
            </button>
            <button onClick={onClose} aria-label="Close find and replace" title="Close" className="p-1 rounded-full bg-white/5 hover:bg-white/15 transition cursor-pointer">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* History Dropdown Panel */}
        {showHistory && (
          <div className="bg-black/40 border border-white/10 rounded-2xl p-3 flex flex-col gap-2 max-h-48 overflow-y-auto text-xs animate-fadeIn">
            <span className="font-medium text-emerald-400 text-[10px] uppercase tracking-wider">Recent Replacements (Click to Revert)</span>
            {history.length === 0 ? (
              <span className="text-zinc-500 text-center py-2 italic text-[11px]">No replacement history yet.</span>
            ) : (
              history.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5 hover:border-white/15 transition">
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-red-400 truncate max-w-25">"{item.find}"</span>
                      <ArrowRight size={10} className="opacity-40 shrink-0" />
                      <span className="text-emerald-400 truncate max-w-25">"{item.replace}"</span>
                    </div>
                    <span className="text-[9px] opacity-40 font-mono">{item.timestamp}</span>
                  </div>
                  <button
                    onClick={() => handleRevert(item)}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 transition rounded-lg text-[10px] font-medium flex items-center gap-1 cursor-pointer text-zinc-200"
                  >
                    <Undo2 size={10} /> Revert
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Find Input with Toggles & Match Counter */}
        <div className="flex flex-col gap-3">
          <div className="relative flex items-center">
            <span className="absolute left-3 opacity-40"><Search size={14} /></span>
            <input
              ref={findInputRef}
              type="text"
              aria-label="Find text"
              placeholder="Find... (Enter/↓ next, Up/Shift+Enter prev)"
              value={findText}
              onChange={(e) => {
                setFindText(e.target.value);
                setCurrentIndex(0);
              }}
              onKeyDown={handleFindKeyDown}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-32 py-2 text-xs outline-none transition"
            />
            
            <div className="absolute right-2 flex items-center gap-1">
              <button
                onClick={() => setMatchCase(!matchCase)}
                aria-label="Match case"
                aria-pressed={matchCase}
                className={`p-1 rounded-lg text-[10px] font-mono font-bold transition ${matchCase ? 'bg-emerald-500 text-black' : 'bg-white/5 opacity-50 hover:opacity-100'}`}
                title="Match Case (Aa)"
              >
                <CaseSensitive size={12} />
              </button>
              <button
                onClick={() => setMatchWholeWord(!matchWholeWord)}
                aria-label="Match whole word"
                aria-pressed={matchWholeWord}
                className={`p-1 rounded-lg text-[10px] font-mono font-bold transition ${matchWholeWord ? 'bg-emerald-500 text-black' : 'bg-white/5 opacity-50 hover:opacity-100'}`}
                title="Match Whole Word (ab)"
              >
                <WholeWord size={12} />
              </button>
              <span className="text-[10px] font-mono opacity-50 px-1">
                {matchCount > 0 ? `${currentIndex + 1} of ${matchCount}` : '0 of 0'}
              </span>
              <button 
                onClick={handlePrevMatch} 
                aria-label="Previous match"
                disabled={matchCount === 0}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                title="Previous Match (Up / Shift+Enter)"
              >
                <ArrowUp size={12} />
              </button>
              <button 
                onClick={handleNextMatch} 
                aria-label="Next match"
                disabled={matchCount === 0}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                title="Next Match (Enter / Down)"
              >
                <ArrowDown size={12} />
              </button>
            </div>
          </div>

          {/* Replace Input */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 opacity-40"><Replace size={14} /></span>
            <input
              type="text"
              aria-label="Replacement text"
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs outline-none transition"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <button
            onClick={handleReplaceSingle}
            disabled={matchCount === 0}
            className="flex-1 bg-white/10 hover:bg-white/25 disabled:opacity-30 transition py-2.5 rounded-xl text-xs font-medium border border-white/10 cursor-pointer flex items-center justify-center gap-1.5"
          >
            Replace <ArrowRight size={12} />
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={matchCount === 0}
            className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-30 transition py-2.5 rounded-xl text-xs font-medium border border-emerald-500/30 cursor-pointer text-white flex items-center justify-center gap-1.5 shadow-lg"
            title="Replace All (Cmd + Enter)"
          >
            <CheckCheck size={14} /> Replace All ({matchCount})
          </button>
        </div>

      </div>
    </div>
  );
}