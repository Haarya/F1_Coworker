import { useEffect, useRef } from 'react';
import { useRaceSession } from '../../context/RaceSessionContext';

export default function LiveTerminal() {
  const { state } = useRaceSession();
  const terminalRef = useRef<HTMLDivElement>(null);

  // During playback, reveal events progressively. When data is loaded but playback hasn't started 
  // (timestamp=0), show all events immediately so the user sees transcripts right away.
  const activeEvents = !state.isExecuting ? [] 
    : state.playbackState === 'playing' 
    ? state.radioEvents.filter(e => e.timestamp <= state.playbackTimestamp)
    : state.radioEvents; // Show all when idle/paused (after Execute)


  return (
    <div className="bg-[#141414] border border-[#333] rounded-xl w-full h-full flex flex-col pointer-events-auto">

      
      <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto font-mono text-xs flex flex-col gap-3 scrollbar-thick pr-2 pb-6">
        {activeEvents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-50 pt-8 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white/30"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono text-center">
              Awaiting Radio<br/>Comms
            </span>
          </div>
        ) : (
          [...activeEvents].reverse().map((event, index) => {
            // Fallbacks for backend properties vs demo properties
            const text = event.transcript || (event as any).text || "Audio garbled...";
            const isDriver = (event as any).role ? (event as any).role === 'DRIVER' : true;
            const roleText = isDriver ? 'DRIVER' : 'OPERATOR';
            const isHighStress = event.cognitiveLoad > 75 || (event as any).isHighStress;
            
            return (
              <div 
                key={event.id || index} 
                className={`p-3 rounded-lg border ${isDriver ? 'border-[var(--theme-40)] bg-[var(--theme-10)] text-white shadow-[0_0_15px_var(--theme-20)]' : 'border-white/10 bg-white/5 text-white/80'} ${isHighStress ? 'border-red-500 shadow-[0_0_25px_rgba(220,38,38,0.5)]' : ''}`}
              >
                <div className="flex justify-between text-[10px] mb-1.5 opacity-70 font-black tracking-widest uppercase">
                  <span className={isDriver ? 'text-[var(--theme-base)]' : 'text-white/40'}>
                    {roleText}
                  </span>
                  {isHighStress && <span className="text-red-400">HIGH STRESS</span>}
                </div>
                <p className="leading-relaxed text-[11px]">{text}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
