interface TextToolsProps {
      content: string;
      onUpdate: (newContent: string) => void;
      widgetClass?: string;
}

export function TextToolsWidget({ content, onUpdate, widgetClass = 'bg-white/5 border border-white/10' }: TextToolsProps) {
      const handleUppercase = () => onUpdate(content.toUpperCase());
      const handleLowercase = () => onUpdate(content.toLowerCase());
      const handleTitleCase = () => onUpdate(content.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()));

  return (
    <div className={`flex items-center justify-between gap-4 ${widgetClass} px-3 py-2 rounded-2xl`}>
      <span className="text-[10px] font-semibold tracking-wider opacity-50 uppercase whitespace-nowrap">Text Transform</span>
      <div className="flex items-center gap-1">
        <button onClick={handleUppercase} title="UPPERCASE"
          className={`${widgetClass} hover:opacity-80 transition px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer`}>
          AA
        </button>
        <button onClick={handleLowercase} title="lowercase"
          className={`${widgetClass} hover:opacity-80 transition px-3 py-1 rounded-xl text-[11px] font-medium cursor-pointer`}>
          aa
        </button>
        <button onClick={handleTitleCase} title="Title Case"
          className={`${widgetClass} hover:opacity-80 transition px-3 py-1 rounded-xl text-[11px] font-medium cursor-pointer`}>
          Aa
        </button>
      </div>
    </div>
  );
}
