import { useEffect, useRef } from 'react';
import { useRaceSession } from '../../context/RaceSessionContext';

export default function LiveTerminal() {
  const { state } = useRaceSession();
  const terminalRef = useRef<HTMLDivElement>(null);

  // Filter events up to current playback time
  const visibleEvents = state.radioEvents.filter(
    (event) => event.timestamp <= state.playbackTimestamp
  );

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleEvents.length]);

  return (
    <div className="bg-[#141414] border border-[#333] rounded-xl w-full h-full flex flex-col pointer-events-auto">

      
      <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto font-mono text-xs flex flex-col gap-2">
        {visibleEvents.length === 0 ? (
          <div className="text-text-secondary italic">Awaiting radio communications...</div>
        ) : (
          visibleEvents.map((event) => {
            const isHighStress = event.cognitiveLoad > 70;
            return (
              <div 
                key={event.id} 
                className={`p-2 rounded border ${isHighStress ? 'border-[#E10600]/50 bg-[#E10600]/10 text-white' : 'border-white/5 bg-white/5 text-text-secondary'}`}
              >
                <div className="flex justify-between text-[9px] mb-1 opacity-70">
                  <span>LAP {event.lapNumber}</span>
                  <span>CL: {Math.round(event.cognitiveLoad)}</span>
                </div>
                <p className="leading-relaxed">{event.transcript}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
