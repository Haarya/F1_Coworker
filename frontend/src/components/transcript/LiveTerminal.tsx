import { useEffect, useRef } from 'react';
import { useRaceSession } from '../../context/RaceSessionContext';

export default function LiveTerminal() {
  const { state } = useRaceSession();
  const terminalRef = useRef<HTMLDivElement>(null);

  // Demo Transcripts for Driver and Operator
  const demoEvents = [
    { id: '1', role: 'DRIVER', text: 'Yeah, the rears are getting a bit warm in turn 3.', isHighStress: false },
    { id: '2', role: 'OPERATOR', text: 'Copy that. We are monitoring tire temps. Keep the pace steady.', isHighStress: false },
    { id: '3', role: 'DRIVER', text: 'Mate, I have absolutely no grip! What is going on?', isHighStress: true },
    { id: '4', role: 'OPERATOR', text: 'Understood Max. Strat 5, switch strat 5.', isHighStress: false },
    { id: '5', role: 'DRIVER', text: 'I can\'t keep this pace up, the tyres are done!', isHighStress: true },
    { id: '6', role: 'OPERATOR', text: 'Box box, Max. Box for hards. Mind the white line on entry.', isHighStress: false },
    { id: '7', role: 'DRIVER', text: 'Okay, balancing is a bit better now.', isHighStress: false },
    { id: '8', role: 'OPERATOR', text: 'Good job. Gap to Norris behind is 4.5 seconds.', isHighStress: false },
    { id: '9', role: 'DRIVER', text: 'He is gaining on the straights, we need more deployment.', isHighStress: false },
    { id: '10', role: 'OPERATOR', text: 'Mode 8 available. Use mode 8 on the main straight.', isHighStress: false },
    { id: '11', role: 'DRIVER', text: 'There is a lot of debris out of turn 4!', isHighStress: true },
    { id: '12', role: 'OPERATOR', text: 'Copy, debris at turn 4. Yellow flag in sector 1.', isHighStress: false }
  ];

  return (
    <div className="bg-[#141414] border border-[#333] rounded-xl w-full h-full flex flex-col pointer-events-auto">

      
      <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto font-mono text-xs flex flex-col gap-3 scrollbar-thick pr-2 pb-6">
        {demoEvents.map((event) => {
          const isDriver = event.role === 'DRIVER';
          return (
            <div 
              key={event.id} 
              className={`p-3 rounded-lg border ${isDriver ? 'border-[var(--theme-40)] bg-[var(--theme-10)] text-white shadow-[0_0_15px_var(--theme-20)]' : 'border-white/10 bg-white/5 text-white/80'}`}
            >
              <div className="flex justify-between text-[10px] mb-1.5 opacity-70 font-black tracking-widest uppercase">
                <span className={isDriver ? 'text-[var(--theme-base)]' : 'text-white/40'}>
                  {event.role}
                </span>
              </div>
              <p className="leading-relaxed text-[11px]">{event.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
