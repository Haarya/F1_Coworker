import React from 'react';
import { useRaceSession } from '../../context/RaceSessionContext';

export default function CircuitMapCard() {
  const { state } = useRaceSession();

  // Extract the name from the circuit path e.g. /Images/F1_circuit/Abu_Dhabi_Circuit.avif -> Abu Dhabi
  const getCircuitName = (path: string) => {
    const filename = path.split('/').pop() || '';
    return filename.replace('_Circuit.avif', '').replace(/_/g, ' ').toUpperCase();
  };

  const currentCircuitName = state.selectedCircuit ? getCircuitName(state.selectedCircuit) : 'SELECT CIRCUIT';

  return (
    <div className="flex-1 bg-[#0d0d0d] rounded-2xl border border-[#E60012]/30 flex flex-col relative min-h-0 p-3 shadow-[0_0_15px_rgba(230,0,18,0.15)] hover:shadow-[0_0_25px_rgba(230,0,18,0.3)] transition-all duration-300 overflow-hidden">
      <h2 className="text-[8px] font-bold uppercase tracking-widest text-[#E60012] mb-3 drop-shadow-[0_0_8px_rgba(230,0,18,0.5)] absolute top-3 left-4 z-20">
        Circuit Map • Live
      </h2>
      
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center z-10 relative mt-4">
         
         {/* Map Image */}
         <div className="w-full flex-1 flex items-center justify-center min-h-0">
            {state.selectedCircuit ? (
               <img src={state.selectedCircuit} alt="Circuit Map" className="w-[95%] h-full object-contain filter invert opacity-80" />
            ) : (
               <div className="w-[80%] h-[80%] border border-dashed border-[#E60012]/20 rounded-xl flex items-center justify-center bg-[#E60012]/5">
                  <span className="text-[#E60012]/40 text-[10px] font-mono tracking-widest uppercase">Select Circuit</span>
               </div>
            )}
         </div>
         
         {/* Circuit Label */}
         <div className="flex flex-col items-center justify-end pb-1 shrink-0">
            <span className="text-[7px] uppercase tracking-[0.2em] text-white/40 font-bold mb-0.5">Grand Prix</span>
            <div className="flex items-center gap-1.5 text-white font-black text-xs tracking-wider uppercase">
               <span className="text-[#E60012] animate-pulse">🔴</span> {currentCircuitName}
            </div>
         </div>

      </div>
    </div>
  );
}
