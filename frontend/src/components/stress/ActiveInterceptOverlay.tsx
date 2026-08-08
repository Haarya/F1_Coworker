import { useRaceSession } from '../../context/RaceSessionContext';
import { useActiveIntercept } from '../../hooks/useActiveIntercept';
import { AlertOctagon } from 'lucide-react';

export default function ActiveInterceptOverlay() {
  const { state } = useRaceSession();
  
  // Use hook to trigger GSAP animations when state.interceptActive changes
  useActiveIntercept(state.interceptActive);

  if (!state.interceptActive) return null;

  return (
    <div className="intercept-overlay absolute inset-0 z-50 pointer-events-none border-[4px] border-accent-red flex items-start justify-center opacity-0">
      {/* Glitch/noise background overlay */}
      <div className="absolute inset-0 bg-accent-red/5 mix-blend-screen pointer-events-none"></div>
      
      <div className="mt-8 bg-black/90 border border-accent-red px-6 py-3 rounded-b-lg shadow-[0_0_30px_rgba(225,6,0,0.5)] flex flex-col items-center backdrop-blur-md">
        <div className="flex items-center gap-3 text-accent-red">
          <AlertOctagon className="animate-pulse" size={24} />
          <h2 className="font-f1 text-xl tracking-widest font-bold">CHANNEL LOCKED</h2>
          <AlertOctagon className="animate-pulse" size={24} />
        </div>
        <p className="text-white text-xs mt-1 tracking-widest uppercase font-mono bg-accent-red/20 px-2 py-0.5 rounded">
          High Cognitive Load + Braking Zone
        </p>
      </div>
    </div>
  );
}
