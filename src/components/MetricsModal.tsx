import { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useDialogFocus } from '../hooks/useDialogFocus';

interface MetricsModalProps {
  characters: number;
  words: number;
  wordLimit: number;
  isWordLimitEnabled: boolean;
  paragraphs: number;
  paragraphLimit: number;
  isParagraphLimitEnabled: boolean;
  pages: number;
  pageLimit: number;
  isPageLimitEnabled: boolean;
  themeStyle: { box: string };
  isOpen: boolean;
  onClose: () => void;
}

export function MetricsModal({
  characters,
  words,
  wordLimit,
  isWordLimitEnabled,
  paragraphs,
  paragraphLimit,
  isParagraphLimitEnabled,
  pages,
  pageLimit,
  isPageLimitEnabled,
  themeStyle,
  isOpen,
  onClose,
}: MetricsModalProps) {
  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, true);
  const isWordOver = isWordLimitEnabled && words > wordLimit;
  const isParagraphOver = isParagraphLimitEnabled && paragraphs > paragraphLimit;
  const isPageOver = isPageLimitEnabled && pages > pageLimit;
  
  const isOverAnyLimit = isWordOver || isParagraphOver || isPageOver;
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-center justify-center z-50 select-none animate-in fade-in duration-200 p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="metrics-modal-title"
        tabIndex={-1}
        style={{ fontFamily: "'Inter', sans-serif" }}
        className={`w-full max-w-110 p-6 rounded-4xl border backdrop-blur-2xl shadow-2xl flex flex-col gap-4 relative transition-all duration-300 focus-visible:outline-none ${
          themeStyle.box
        } ${
          isOverAnyLimit
            ? 'border-red-500/50! text-white'
            : 'border-white/15'
        }`}
      >
        {/* Header / Close button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            {isOverAnyLimit && <AlertCircle size={16} className="text-red-400 animate-pulse" />}
            <span id="metrics-modal-title" className={`font-semibold text-sm uppercase ${isOverAnyLimit ? 'text-red-400 font-bold' : 'opacity-80'}`}>
              {isOverAnyLimit ? 'Writing Limits Reached' : 'Document Statistics'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close statistics"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 transition cursor-pointer opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>

        {/* Stats Grid with Live Counts & Individual Warning Highlights */}
        <div className="grid grid-cols-2 gap-3 text-center py-1">
          <div className={`p-3 rounded-2xl border ${isWordOver ? 'bg-red-950/50 border-red-500' : 'bg-white/5 border-white/10'}`}>
            <span className={`text-sm font-medium block mb-1 ${isWordOver ? 'text-red-300' : 'text-white'}`}>Words</span>
            <span className={`text-xl font-semibold ${isWordOver ? 'text-red-400 font-bold' : 'text-white'}`}>{words}</span>
          </div>

          <div className={`p-3 rounded-2xl border ${isParagraphOver ? 'bg-red-950/50 border-red-500' : 'bg-white/5 border-white/10'}`}>
            <span className={`text-sm font-medium block mb-1 ${isParagraphOver ? 'text-red-300' : 'text-white'}`}>Paragraphs</span>
            <span className={`text-xl font-semibold ${isParagraphOver ? 'text-red-400 font-bold' : 'text-white'}`}>{paragraphs}</span>
          </div>

          <div className={`p-3 rounded-2xl border ${isPageOver ? 'bg-red-950/50 border-red-500' : 'bg-white/5 border-white/10'}`}>
            <span className={`text-sm font-medium block mb-1 ${isPageOver ? 'text-red-300' : 'text-white'}`}>Pages</span>
            <span className={`text-xl font-semibold ${isPageOver ? 'text-red-400 font-bold' : 'text-white'}`}>{pages}</span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-sm font-medium text-white block mb-1">Characters</span>
            <span className="text-xl font-semibold text-white">{characters}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
