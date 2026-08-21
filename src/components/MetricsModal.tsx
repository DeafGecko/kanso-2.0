import { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

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

  const limitLabel = (limit: number, enabled: boolean) => enabled ? limit.toLocaleString() : 'Off';

  return (
    <div
      className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-center justify-center z-50 select-none animate-in fade-in duration-200 p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="metrics-modal-title"
        className={`w-full max-w-[440px] p-6 rounded-[2rem] border backdrop-blur-2xl shadow-2xl flex flex-col gap-4 relative transition-all duration-300 ${
          themeStyle.box
        } ${
          isOverAnyLimit
            ? '!border-red-500/50 text-white'
            : 'border-white/15'
        }`}
      >
        {/* Header / Close button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            {isOverAnyLimit && <AlertCircle size={16} className="text-red-400 animate-pulse" />}
            <span id="metrics-modal-title" className={`font-semibold text-xs tracking-wider uppercase ${isOverAnyLimit ? 'text-red-400 font-bold' : 'opacity-80'}`}>
              {isOverAnyLimit ? 'Document Limit Exceeded' : 'Document Statistics'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close statistics"
            className="p-1 rounded-full bg-white/5 hover:bg-white/15 transition cursor-pointer opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>

        {/* Stats Grid with Live Counts & Individual Warning Highlights */}
        <div className="grid grid-cols-2 gap-3 text-center py-1">
          <div className={`p-3 rounded-2xl border ${isWordOver ? 'bg-red-950/50 border-red-500' : 'bg-white/5 border-white/10'}`}>
            <span className={`text-[9px] uppercase tracking-wider block mb-1 ${isWordOver ? 'text-red-300' : 'opacity-40'}`}>Words · {limitLabel(wordLimit, isWordLimitEnabled)}</span>
            <span className={`text-base font-semibold ${isWordOver ? 'text-red-400 font-bold' : ''}`}>{words}</span>
          </div>

          <div className={`p-3 rounded-2xl border ${isParagraphOver ? 'bg-red-950/50 border-red-500' : 'bg-white/5 border-white/10'}`}>
            <span className={`text-[9px] uppercase tracking-wider block mb-1 ${isParagraphOver ? 'text-red-300' : 'opacity-40'}`}>Paragraphs · {limitLabel(paragraphLimit, isParagraphLimitEnabled)}</span>
            <span className={`text-base font-semibold ${isParagraphOver ? 'text-red-400 font-bold' : ''}`}>{paragraphs}</span>
          </div>

          <div className={`p-3 rounded-2xl border ${isPageOver ? 'bg-red-950/50 border-red-500' : 'bg-white/5 border-white/10'}`}>
            <span className={`text-[9px] uppercase tracking-wider block mb-1 ${isPageOver ? 'text-red-300' : 'opacity-40'}`}>Pages · {limitLabel(pageLimit, isPageLimitEnabled)}</span>
            <span className={`text-base font-semibold ${isPageOver ? 'text-red-400 font-bold' : ''}`}>{pages}</span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[9px] opacity-40 uppercase tracking-wider block mb-1">Characters</span>
            <span className="text-base font-semibold">{characters}</span>
          </div>
        </div>

        {isOverAnyLimit && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-center">
            <p className="text-xs text-red-300 font-medium">
              {[
                isWordOver && `Words are ${words - wordLimit} over`,
                isParagraphOver && `Paragraphs are ${paragraphs - paragraphLimit} over`,
                isPageOver && `Pages are ${pages - pageLimit} over`,
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
