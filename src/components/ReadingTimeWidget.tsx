import { Clock } from 'lucide-react';

interface ReadingTimeProps {
      words: number;
}

export function ReadingTimeWidget({ words }: ReadingTimeProps) {

// Average silent reading speed: ~238 words per minute
      const silentMinutes = Math.ceil(words / 238);

// Average speech/presentation speed: ~130 words per minute
      const speechMinutes = Math.ceil(words / 130);

  return (
    <div className="flex flex-col gap-2 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
      <span className="text-[10px] font-semibold tracking-wider opacity-50 uppercase flex items-center gap-1">
        <Clock size={12} /> Time Estimates
      </span>
      <div className="grid grid-cols-2 gap-2 mt-1 text-center">
        <div className="bg-white/5 p-2 rounded-xl border border-white/10">
          <span className="text-[10px] opacity-50 block uppercase">Reading</span>
          <span className="text-xs font-semibold">{words === 0 ? '0 min' : `~${silentMinutes} min`}</span>
        </div>
        <div className="bg-white/5 p-2 rounded-xl border border-white/10">
          <span className="text-[10px] opacity-50 block uppercase">Speech</span>
          <span className="text-xs font-semibold">{words === 0 ? '0 min' : `~${speechMinutes} min`}</span>
        </div>
      </div>
    </div>
  );
}