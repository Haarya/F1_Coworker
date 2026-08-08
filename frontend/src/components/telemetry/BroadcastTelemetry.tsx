import { useRaceSession } from '../../context/RaceSessionContext';

export default function BroadcastTelemetry() {
  const { state } = useRaceSession();

  const throttlePercent = Math.max(0, Math.min(100, state.currentThrottle));
  const brakePercent = Math.max(0, Math.min(100, state.currentBrake));
  const speed = Math.round(state.currentSpeed);

  // Generate segmented blocks for the bars
  const totalSegments = 12;
  const thrSegmentsActive = Math.ceil((throttlePercent / 100) * totalSegments);
  const brkSegmentsActive = Math.ceil((brakePercent / 100) * totalSegments);

  return (
    <div className="bg-[#141414] border border-[#333] rounded-xl p-4 w-full h-full flex items-end justify-between pointer-events-auto relative overflow-hidden">
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      <div className="relative z-10 flex gap-6 items-end w-full justify-center">
        {/* Speed Readout */}
        <div className="flex flex-col items-center justify-end w-24 mb-2">
          <span className="text-[10px] text-text-secondary tracking-widest uppercase mb-1">Speed</span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-mono font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {speed.toString().padStart(3, '0')}
            </span>
          </div>
          <span className="text-[10px] text-text-secondary">KM/H</span>
        </div>

        {/* Throttle Bar */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-32 flex flex-col-reverse gap-[2px]">
            {Array.from({ length: totalSegments }).map((_, i) => (
              <div
                key={i}
                className={`w-full flex-1 rounded-sm transition-all duration-75 ${
                  i < thrSegmentsActive 
                    ? 'bg-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.8)]' 
                    : 'bg-[#333]'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Thr</span>
        </div>

        {/* Brake Bar */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-32 flex flex-col-reverse gap-[2px]">
            {Array.from({ length: totalSegments }).map((_, i) => (
              <div
                key={i}
                className={`w-full flex-1 rounded-sm transition-all duration-75 ${
                  i < brkSegmentsActive 
                    ? 'bg-[#E31D2B] shadow-[0_0_8px_rgba(227,29,43,0.8)]' 
                    : 'bg-[#333]'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-text-secondary tracking-widest uppercase font-bold">Brk</span>
        </div>
      </div>
    </div>
  );
}
