import { useState, useRef, useEffect } from 'react';
import { useKansoStore } from './store/useKansoStore';
import { PanelRightOpen, PanelRightClose, Sun, Coffee, Moon, FileText, FolderOpen, Plus, Sliders } from 'lucide-react';
import { TextToolsWidget } from './components/TextToolsWidget';
import { ScratchpadWidget } from './components/ScratchpadWidget';
import { MetricsModal } from './components/MetricsModal';
import { SpellChecker } from './components/SpellChecker';
import { FindReplaceModal } from './components/FindReplaceModal';
import { ShortcutModal } from './components/ShortcutModal';
import { CommandPalette } from './components/CommandPalette';

// Main Application Component
export default function App() {
  const { notes, activeNoteId, updateNote, addNote, toolbox, toggleToolboxItem } = useKansoStore();
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(true);
  const [isCustomizingToolbox, setIsCustomizingToolbox] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // State for theme, font, and limits
  const [currentTheme, setCurrentTheme] = useState<'light' | 'coffee' | 'dark'>('dark');
  const [fontFamily, setFontFamily] = useState('Georgia, serif');
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const [wordLimit, setWordLimit] = useState(500);
  const isWordLimitEnabled = true;
  const [paragraphLimit, setParagraphLimit] = useState(10);
  const isParagraphLimitEnabled = true;
  const [pageLimit, setPageLimit] = useState(1);
  const isPageLimitEnabled = true;
  const [fontSize, setFontSize] = useState<number>(18);
  const [spellCheckKey, setSpellCheckKey] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousLimitWarningsRef = useRef({ words: false, paragraphs: false, pages: false });
  const [textareaScrolled, setTextareaScrolled] = useState(false);
  const [textareaHasMore, setTextareaHasMore] = useState(false);
  const [toolboxScrolled, setToolboxScrolled] = useState(false);
  const [toolboxHasMore, setToolboxHasMore] = useState(false);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];
  const content = activeNote?.content || '';

  const characters = content.length;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const paragraphs = content.trim() ? content.split(/\n+/).length : 0;
  const pages = Math.max(1, Math.ceil(words / 250));

  // Check if any limits are exceeded
  const isWordLimitTracking = toolbox.wordLimit && isWordLimitEnabled;
  const isParagraphLimitTracking = toolbox.paragraphLimit && isParagraphLimitEnabled;
  const isPageLimitTracking = toolbox.pageLimit && isPageLimitEnabled;
  const isWordOver = isWordLimitTracking && words > wordLimit;
  const isParagraphOver = isParagraphLimitTracking && paragraphs > paragraphLimit;
  const isPageOver = isPageLimitTracking && pages > pageLimit;
  const isOverAnyLimit = isWordOver || isParagraphOver || isPageOver;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    setTextareaHasMore(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, [content]);

  useEffect(() => {
    const previous = previousLimitWarningsRef.current;
    const hasNewWarning = (isWordOver && !previous.words)
      || (isParagraphOver && !previous.paragraphs)
      || (isPageOver && !previous.pages);

    if (hasNewWarning && toolbox.metricsModal) {
      setIsStatsModalOpen(true);
    }

    previousLimitWarningsRef.current = {
      words: isWordOver,
      paragraphs: isParagraphOver,
      pages: isPageOver,
    };
  }, [isWordOver, isParagraphOver, isPageOver, toolbox.metricsModal]);

  // Snippet Macro Expander handler
  const handleKeyDownTextarea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const textBeforeCursor = content.substring(0, start);
      const wordsArr = textBeforeCursor.split(/\s+/);
      const lastWord = wordsArr[wordsArr.length - 1];

      let replacement = '';
      let triggerLength = lastWord.length;

      if (lastWord === '==') {
        replacement = '\n---\n';
      } else if (lastWord === 'date') {
        replacement = new Date().toLocaleDateString();
      } else if (lastWord === 'h1') {
        replacement = '# ';
      } else if (lastWord === 'todo') {
        replacement = '- [ ] ';
      }

      if (replacement) {
        e.preventDefault();
        const newContent = content.substring(0, start - triggerLength) + replacement + content.substring(end);
        updateNote(activeNote.id, newContent);
        
        setTimeout(() => {
          if (textarea) {
            const newCursorPos = start - triggerLength + replacement.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);
      }
    }
  };

// Global keyboard shortcuts
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
        setIsFontDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      const isEditableTarget = target instanceof HTMLElement
        && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      
// Cmd + J for Stats Modal
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsStatsModalOpen((prev) => !prev);
      }
      
// Cmd + F for Find & Replace Modal (with Selection Auto-Fill)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (textarea) {
          const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
          if (selectedText.trim()) {
            setFindQuery(selectedText);
          }
        }
        setIsFindReplaceOpen(true);
      }
      
// Cmd + Shift + F for Focus Mode Chrome Collapse
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      }
      
// Cmd + K or Alt + / for Command Palette
      if ((e.altKey && e.key === '/') || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

// Shift + / for Shortcut Cheat Sheet
  if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey && !isEditableTarget) {
        e.preventDefault();
        setIsShortcutModalOpen((prev) => !prev);
      }
      
// Cmd + = or Cmd + Plus for Zoom In
      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setFontSize((prev) => Math.min(prev + 2, 32));
      }

// Cmd + - for Zoom Out
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        setFontSize((prev) => Math.max(prev - 2, 12));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

// Function to get theme styles based on current theme
  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'light':
        return { bg: 'bg-[#D8D8DC]', text: 'text-[#111113]', box: 'border-[#c0c0c4]/40 text-[#111113] shadow-sm', bgStyle: { backgroundColor: '#D8D8DC' }, boxStyle: { backgroundColor: '#e8e8ec', color: '#111113' }, widget: 'bg-black/8 border border-black/10', input: 'bg-white border border-black/15 text-[#111113]' };
      case 'coffee':
        return { bg: 'bg-[#26211e]', text: 'text-[#f5ebd6]', box: 'bg-[#332c28]/90 border-[#4a3f3a]/50 text-[#f5ebd6] shadow-2xl', bgStyle: {}, boxStyle: {}, widget: 'bg-white/5 border border-[#5a4f48]/50', input: 'bg-black/30 border border-[#5a4f48]/40' };
      case 'dark':
      default:
        return { bg: 'bg-[#181818]', text: 'text-[#f5f5f7]', box: 'bg-[#1c1c1e]/80 border-white/10 text-[#f5f5f7] shadow-2xl', bgStyle: {}, boxStyle: {}, widget: 'bg-white/5 border border-white/10', input: 'bg-black/30 border border-white/10' };
    }
  };
  const themeStyle = getThemeStyles();

  return (
    <div data-theme={currentTheme} className={`h-screen w-screen flex flex-col ${themeStyle.bg} ${themeStyle.text} font-sans pt-6 px-8 pb-8 box-border transition-colors duration-500 select-none overflow-hidden`} style={themeStyle.bgStyle}>
      
{/* Hidden during Focus Mode! */}
      {!isFocusMode && (
        <header className="flex items-center justify-between mb-4 px-2 shrink-0 animate-fadeIn">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-widest font-serif opacity-90">KANSO</h1>

            {isOverAnyLimit && (
              <button
                onClick={() => setIsStatsModalOpen(true)}
                title="Open document statistics (Cmd + J)"
                className="flex h-8 items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 text-[10px] font-sans shadow-sm backdrop-blur-md transition hover:bg-red-500/15 cursor-pointer"
              >
                <span>{characters} Characters</span>
                <span aria-hidden="true" className="opacity-30">|</span>
                <span className={`transition-colors ${isWordOver ? 'font-semibold text-red-400' : ''}`}>{words} Words</span>
                <span aria-hidden="true" className="opacity-30">|</span>
                <span className={`transition-colors ${isParagraphOver ? 'font-semibold text-red-400' : ''}`}>{paragraphs} Paragraphs</span>
                <span aria-hidden="true" className="opacity-30">|</span>
                <span className={`transition-colors ${isPageOver ? 'font-semibold text-red-400' : ''}`}>{pages} Pages</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isPreferencesOpen && (
              <button 
                onClick={() => setIsPreferencesOpen(true)} 
                aria-label="Open preferences"
                title="Open preferences"
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/10 transition flex items-center justify-center shadow-sm cursor-pointer"
              >
                <PanelRightOpen size={14} />
              </button>
            )}
          </div>
        </header>
      )}

{/* Main Container */}
      <div className="flex-1 flex gap-4 min-h-0 relative overflow-hidden">
        
{/* Writing Canvas & Minimap Container */}
        <main className={`flex-1 flex flex-row ${themeStyle.box} border backdrop-blur-xl rounded-4xl pt-8 pb-8 pl-8 pr-2 transition-all duration-300 relative min-h-0 overflow-hidden gap-4`} style={themeStyle.boxStyle}>
          
          <div className="relative flex-1 flex min-h-0 overflow-hidden" style={{ maskImage: `linear-gradient(to bottom, ${textareaScrolled ? 'transparent 0%, black 6%' : 'black 0%'}, ${textareaHasMore ? 'black 94%, transparent 100%' : 'black 100%'})`, WebkitMaskImage: `linear-gradient(to bottom, ${textareaScrolled ? 'transparent 0%, black 6%' : 'black 0%'}, ${textareaHasMore ? 'black 94%, transparent 100%' : 'black 100%'})` }}>
            {toolbox.spellCheck && (
              <SpellChecker
                content={content}
                scrollRef={textareaRef}
                fontFamily={fontFamily}
                fontSize={fontSize}
                onReplaceAll={(oldWord, newWord) => {
                  const updated = content.split(oldWord).join(newWord);
                  updateNote(activeNote.id, updated);
                }}
              />
            )}
            <textarea
              key={spellCheckKey}
              ref={textareaRef}
              value={content}
              onChange={(e) => updateNote(activeNote.id, e.target.value)}
              onKeyDown={handleKeyDownTextarea}
              onScroll={(e) => { const el = e.target as HTMLTextAreaElement; setTextareaScrolled(el.scrollTop > 0); setTextareaHasMore(el.scrollTop + el.clientHeight < el.scrollHeight - 4); }}
              placeholder="Hey! This is your focused writing space — feel free to write anything here."
              spellCheck={false}
              className="relative w-full h-full bg-transparent border-none outline-none resize-none placeholder:text-zinc-500/60 overflow-y-auto py-0 pl-0 pr-8 caret-white selection:bg-emerald-500/30"
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.7, letterSpacing: 0, wordSpacing: '0.08em', caretColor: 'auto', fontFamily }}
            />
          </div>

        </main>

{/* Modular Toolbox Sidebar (Hidden during Focus Mode!) */}
        {!isFocusMode && (
          <aside className={`${isPreferencesOpen ? 'w-84' : 'w-0 overflow-hidden opacity-0'} transition-all duration-500 ease-in-out ${themeStyle.box} border backdrop-blur-xl rounded-[1.5rem] shadow-2xl shrink-0 min-h-0 overflow-hidden flex flex-col`} style={themeStyle.boxStyle}><div onScroll={(e) => { const el = e.target as HTMLDivElement; setToolboxScrolled(el.scrollTop > 0); setToolboxHasMore(el.scrollTop + el.clientHeight < el.scrollHeight - 4); }} className="flex flex-col gap-4 flex-1 overflow-y-auto pl-5 pt-5 pb-5 pr-3" style={{ maskImage: `linear-gradient(to bottom, ${toolboxScrolled ? 'transparent 0%, black 8%' : 'black 0%'}, ${toolboxHasMore ? 'black 92%, transparent 100%' : 'black 100%'})`, WebkitMaskImage: `linear-gradient(to bottom, ${toolboxScrolled ? 'transparent 0%, black 8%' : 'black 0%'}, ${toolboxHasMore ? 'black 92%, transparent 100%' : 'black 100%'})` }}>
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-medium tracking-wide text-xs uppercase opacity-70">Toolbox</span>
                <button 
                  onClick={() => setIsCustomizingToolbox(!isCustomizingToolbox)} 
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${isCustomizingToolbox ? 'bg-white text-black' : 'opacity-60 hover:opacity-100 bg-white/5'}`}
                  title="Customize Widgets"
                >
                  <Sliders size={12} />
                </button>
              </div>
              <button onClick={() => setIsPreferencesOpen(false)} className="opacity-60 hover:opacity-100 transition cursor-pointer"><PanelRightClose size={16} /></button>
            </div>

{/* Toolbox Widgets */}
            {isCustomizingToolbox && (
              <div className={`${themeStyle.widget} p-3.5 rounded-2xl flex flex-col gap-2.5 text-xs shrink-0`}>
                <span className={`font-medium mb-0.5 ${currentTheme === 'light' ? 'text-[#111113]' : 'text-white'}`}>Customize Widgets:</span>
                {Object.keys(toolbox).filter((key) => !['minimap', 'pomodoro', 'readingTime'].includes(key)).map((key) => {
                  const isActive = toolbox[key as keyof typeof toolbox];
                  return (
                    <label
                      key={key} 
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <span className="capitalize opacity-70 group-hover:opacity-100 transition">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        type="checkbox"
                        role="switch"
                        checked={isActive}
                        onChange={() => {
                          toggleToolboxItem(key as keyof typeof toolbox);
                          if (key === 'spellCheck') setSpellCheckKey((currentKey) => currentKey + 1);
                        }}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`relative h-4 w-7 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-white/30 ${isActive ? 'bg-white/90' : 'bg-white/20'}`}
                      >
                        <span className={`absolute left-0.5 top-0.5 h-3 w-3 rounded-full shadow-sm transition-all ${isActive ? 'translate-x-3 bg-zinc-800' : 'translate-x-0 bg-white'}`} />
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

{/* Toolbox Widgets - themes */}
            {toolbox.theme && (
              <div className="flex flex-col gap-1.5 shrink-0">
                <span className="text-[10px] font-semibold tracking-wider opacity-50 uppercase">Theme</span>
                <div className={`flex items-center gap-1 ${themeStyle.widget} p-1 rounded-2xl`}>
                  <button onClick={() => setCurrentTheme('light')} className={`flex-1 py-1.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${currentTheme === 'light' ? 'bg-white text-black shadow-sm' : 'opacity-50 hover:opacity-100'}`}><Sun size={14} /></button>
                  <button onClick={() => setCurrentTheme('coffee')} className={`flex-1 py-1.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${currentTheme === 'coffee' ? 'bg-[#4a3f3a] text-white shadow-sm' : 'opacity-50 hover:opacity-100'}`}><Coffee size={14} /></button>
                  <button onClick={() => setCurrentTheme('dark')} className={`flex-1 py-1.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${currentTheme === 'dark' ? 'bg-white/20 text-white shadow-sm' : 'opacity-50 hover:opacity-100'}`}><Moon size={14} /></button>
                </div>
              </div>
            )}

{/* Toolbox Widgets - font family */}
            {toolbox.font && (() => {
              const fonts = [
                { value: 'Georgia, serif', label: 'Georgia', sub: 'Classic' },
                { value: "'Merriweather', serif", label: 'Merriweather', sub: 'Elegant' },
                { value: "'Lora', serif", label: 'Lora', sub: 'Modern Serif' },
                { value: "'Playfair Display', serif", label: 'Playfair Display', sub: 'Stylish' },
                { value: "'EB Garamond', serif", label: 'EB Garamond', sub: 'Literary' },
                { value: "'Crimson Text', serif", label: 'Crimson Text', sub: 'Warm' },
                { value: "'Inter', sans-serif", label: 'Inter', sub: 'Modern' },
                { value: "'Courier Prime', monospace", label: 'Courier Prime', sub: 'Screenplay' },
              ];
              const active = fonts.find(f => f.value === fontFamily);
              return (
                <div className="flex flex-col gap-1.5 shrink-0" ref={fontDropdownRef}>
                  <span className="text-[10px] font-semibold tracking-wider opacity-50 uppercase">Font Family</span>
                  <button
                    onClick={() => setIsFontDropdownOpen(o => !o)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl ${themeStyle.widget} hover:opacity-80 transition-colors cursor-pointer`}
                  >
                    <div className="text-left flex items-center justify-between flex-1 mr-2">
                      <span style={{ fontFamily }} className={`text-sm leading-tight ${currentTheme === 'light' ? 'text-[#111113]' : 'text-white'}`}>{active?.label}</span>
                      <span className="text-[9px] opacity-40 tracking-wider uppercase font-sans">{active?.sub}</span>
                    </div>
                    <svg className={`w-3 h-3 opacity-40 transition-transform ${isFontDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isFontDropdownOpen && (
                    <div className="flex flex-col gap-0.5 bg-zinc-900/95 border border-white/10 rounded-xl p-1 shadow-xl backdrop-blur-md">
                      {fonts.map(({ value, label, sub }) => (
                        <button
                          key={value}
                          onClick={() => { setFontFamily(value); setIsFontDropdownOpen(false); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${fontFamily === value ? 'bg-white/15 text-white' : 'hover:bg-white/8 text-white/70 hover:text-white'}`}
                        >
                          <span style={{ fontFamily: value }} className="text-sm leading-tight">{label}</span>
                          <span className="text-[9px] opacity-40 tracking-wider uppercase font-sans">{sub}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {toolbox.textTools && <div className="shrink-0"><TextToolsWidget content={content} onUpdate={(newText) => updateNote(activeNote.id, newText)} widgetClass={themeStyle.widget} /></div>}

{/* Toolbox Widgets - word limit */}
            {toolbox.wordLimit && (
              <div className={`flex items-center justify-between gap-4 ${themeStyle.widget} px-3 py-2 rounded-2xl shrink-0`}>
                <span className="text-[10px] font-semibold tracking-wider opacity-50 uppercase whitespace-nowrap">Word Limit</span>
                <input type="number" value={wordLimit} onChange={(e) => setWordLimit(Number(e.target.value))} className={`${themeStyle.input} rounded-lg pl-2 pr-0 py-1 text-xs font-semibold text-right outline-none w-24 mr-1`} />
              </div>
            )}

{/* Toolbox Widgets - paragraph limit */}
            {toolbox.paragraphLimit && (
              <div className={`flex items-center justify-between gap-4 ${themeStyle.widget} px-3 py-2 rounded-2xl shrink-0`}>
                <span className="text-[10px] font-semibold tracking-wider opacity-50 uppercase whitespace-nowrap">Paragraph Limit</span>
                <input type="number" value={paragraphLimit} onChange={(e) => setParagraphLimit(Number(e.target.value))} className={`${themeStyle.input} rounded-lg pl-2 pr-0 py-1 text-xs font-semibold text-right outline-none w-24 mr-1`} />
              </div>
            )}

{/* Toolbox Widgets - page limit */}
            {toolbox.pageLimit && (
              <div className={`flex items-center justify-between gap-4 ${themeStyle.widget} px-3 py-2 rounded-2xl shrink-0`}>
                <span className="text-[10px] font-semibold tracking-wider opacity-50 uppercase whitespace-nowrap">Page Limit</span>
                <input type="number" value={pageLimit} onChange={(e) => setPageLimit(Number(e.target.value))} className={`${themeStyle.input} rounded-lg pl-2 pr-0 py-1 text-xs font-semibold text-right outline-none w-24 mr-1`} />
              </div>
            )}

            {toolbox.scratchpad && <div className="shrink-0"><ScratchpadWidget widgetClass={themeStyle.widget} inputClass={themeStyle.input} /></div>}

            {toolbox.files && (
              <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-white/10 shrink-0">
                <span className="text-[10px] font-semibold tracking-wider opacity-50 uppercase">Files</span>
                <button onClick={() => {
                  const element = document.createElement('a');
                  element.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
                  element.download = `${activeNote?.title || 'kanso-document'}.txt`;
                  element.click();
                }} className={`flex items-center gap-2.5 w-full ${themeStyle.widget} hover:opacity-80 transition p-2 rounded-xl text-xs cursor-pointer`}>
                  <FileText size={14} /> Save File
                </button>
                <input type="file" ref={fileInputRef} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => { if (ev.target?.result) addNote(file.name.replace(/\.[^/.]+$/, ""), ev.target.result as string); };
                    reader.readAsText(file);
                  }
                }} accept=".txt,.md" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-2.5 w-full ${themeStyle.widget} hover:opacity-80 transition p-2 rounded-xl text-xs cursor-pointer`}>
                  <FolderOpen size={14} /> Open File
                </button>
                <button onClick={() => addNote('New Document', '')} className={`flex items-center gap-2.5 w-full ${themeStyle.widget} hover:opacity-80 transition p-2 rounded-xl text-xs cursor-pointer`}>
                  <Plus size={14} /> New Document
                </button>
              </div>
            )}
          </div></aside>
        )}

        {/* Modals */}
        {toolbox.metricsModal && (
          <MetricsModal
            characters={characters}
            words={words}
            wordLimit={wordLimit}
            isWordLimitEnabled={isWordLimitTracking}
            paragraphs={paragraphs}
            paragraphLimit={paragraphLimit}
            isParagraphLimitEnabled={isParagraphLimitTracking}
            pages={pages}
            pageLimit={pageLimit}
            isPageLimitEnabled={isPageLimitTracking}
            themeStyle={themeStyle}
            isOpen={isStatsModalOpen}
            onClose={() => setIsStatsModalOpen(false)}
          />
        )}

        <FindReplaceModal
          content={content}
          onUpdate={(newContent) => updateNote(activeNote.id, newContent)}
          isOpen={isFindReplaceOpen}
          initialQuery={findQuery}
          textareaRef={textareaRef}
          onClose={() => { setIsFindReplaceOpen(false); setFindQuery(''); }}
          onSearchChange={(q) => setFindQuery(q)}
        />

        <ShortcutModal
          isOpen={isShortcutModalOpen}
          onClose={() => setIsShortcutModalOpen(false)}
        />

        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onOpenStats={() => setIsStatsModalOpen(true)}
          onOpenShortcuts={() => setIsShortcutModalOpen(true)}
          onOpenFind={() => setIsFindReplaceOpen(true)}
          onTogglePreferences={() => setIsPreferencesOpen(!isPreferencesOpen)}
          onToggleToolboxDrawer={() => setIsCustomizingToolbox((prev) => !prev)}
          onSetTheme={(theme) => setCurrentTheme(theme)}
          onSaveFile={() => {
            const element = document.createElement('a');
            element.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
            element.download = `${activeNote?.title || 'kanso-document'}.txt`;
            element.click();
          }}
          onNewDocument={() => addNote('New Document', '')}
        />
      </div>
    </div>
  );
}