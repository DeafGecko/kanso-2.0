import { useRef, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';

const WORDS_PER_PAGE = 250;
const LINE_H = 3;
const LINE_GAP = 1;
const PADDING_X = 4;
const CHAR_W = 1.6;

interface MinimapProps {
  content: string;
  pageLimit: number;
  isPageLimitEnabled: boolean;
  scrollRef: RefObject<HTMLTextAreaElement | null>;
  findQuery: string;
}

function getFindMatchLines(content: string, query: string): Set<number> {
  if (!query.trim()) return new Set();
  const lines = content.split('\n');
  const found = new Set<number>();
  const lower = query.toLowerCase();
  lines.forEach((line, i) => {
    if (line.toLowerCase().includes(lower)) found.add(i);
  });
  return found;
}

export function Minimap({ content, pageLimit, isPageLimitEnabled, scrollRef, findQuery }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef(content);
  const findRef = useRef(findQuery);
  contentRef.current = content;
  findRef.current = findQuery;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (W === 0 || H === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const lines = contentRef.current.split('\n');
    const totalLines = lines.length;
    const findMatches = getFindMatchLines(contentRef.current, findRef.current);

    // --- Text bars ---
    lines.forEach((line, i) => {
      const y = i * (LINE_H + LINE_GAP) + 2;
      if (y > H) return;

      const trimmed = line.trimStart();
      const indent = (line.length - trimmed.length) * CHAR_W * 0.5;
      const textW = Math.min(trimmed.length * CHAR_W, W - PADDING_X * 2 - indent);

      // Find match = yellow, heading = bright white, normal = dim
      if (findMatches.has(i)) {
        ctx.fillStyle = 'rgba(250,204,21,0.85)';
      } else if (trimmed.startsWith('#')) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
      }

      if (textW > 0) {
        ctx.beginPath();
        ctx.roundRect(PADDING_X + indent, y, textW, LINE_H, 1);
        ctx.fill();
      }

      // Empty line: still draw a tiny tick so the line exists visually
      if (textW <= 0) return;
    });

    // --- Page break lines ---
    if (totalLines > 0) {
      const words = contentRef.current.trim().split(/\s+/).filter(Boolean).length;
      const linesPerPage = words > 0 ? totalLines / (words / WORDS_PER_PAGE) : totalLines;
      const numPages = isPageLimitEnabled ? pageLimit : Math.ceil(words / WORDS_PER_PAGE);
      for (let p = 1; p <= numPages; p++) {
        const y = Math.round(p * linesPerPage) * (LINE_H + LINE_GAP) + 2;
        if (y <= 0 || y > H) continue;
        ctx.save();
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 0.75;
        ctx.strokeStyle = isPageLimitEnabled && p === pageLimit
          ? 'rgba(239,68,68,0.7)'
          : 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.moveTo(2, y);
        ctx.lineTo(W - 2, y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // --- Viewport box: tracks inside minimap content space ---
    const el = scrollRef.current;
    if (el && el.scrollHeight > el.clientHeight) {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const contentPxInMinimap = totalLines * (LINE_H + LINE_GAP);
      const visibleFraction = clientHeight / scrollHeight;
      const scrollFraction = scrollTop / (scrollHeight - clientHeight);
      const boxH = Math.max(10, visibleFraction * contentPxInMinimap);
      const maxTop = Math.min(contentPxInMinimap - boxH, H - boxH);
      const boxY = scrollFraction * maxTop;

      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(1, boxY, W - 2, boxH, 3);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }, [pageLimit, isPageLimitEnabled, scrollRef]);

  // Hide native textarea scrollbar
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.style.scrollbarWidth = 'none';
    const style = document.createElement('style');
    style.textContent = 'textarea::-webkit-scrollbar { display: none; }';
    document.head.appendChild(style);
    return () => style.remove();
  }, [scrollRef]);

  // Redraw on scroll so viewport box tracks correctly
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', draw);
    return () => el.removeEventListener('scroll', draw);
  }, [scrollRef, draw]);

  useEffect(() => { draw(); }, [content, pageLimit, isPageLimitEnabled, findQuery, draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  // Click minimap to jump textarea to that position
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const totalLines = contentRef.current.split('\n').length;
    const contentPxInMinimap = totalLines * (LINE_H + LINE_GAP);
    const visibleFraction = el.clientHeight / el.scrollHeight;
    const boxH = Math.max(10, visibleFraction * contentPxInMinimap);
    const maxTop = Math.min(contentPxInMinimap - boxH, rect.height - boxH);
    const clickFraction = (e.clientY - rect.top) / rect.height;
    const targetFraction = (clickFraction * rect.height - boxH / 2) / maxTop;
    el.scrollTop = Math.max(0, targetFraction) * (el.scrollHeight - el.clientHeight);
  }, [scrollRef]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    const textarea = scrollRef.current;
    if (!textarea) return;

    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault();
      textarea.scrollBy({ top: textarea.clientHeight * 0.8 });
    } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault();
      textarea.scrollBy({ top: -textarea.clientHeight * 0.8 });
    } else if (event.key === 'Home') {
      event.preventDefault();
      textarea.scrollTop = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [scrollRef]);

  return (
    <button
      type="button"
      aria-label="Document minimap. Use arrow, Page Up, Page Down, Home, or End keys to navigate."
      className="w-16 self-stretch shrink-0 rounded-xl overflow-hidden opacity-30 hover:opacity-70 transition-opacity duration-300 cursor-pointer select-none"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <canvas
        aria-hidden="true"
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </button>
  );
}
