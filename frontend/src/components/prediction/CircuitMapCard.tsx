import { useRaceSession } from '../../context/RaceSessionContext';
import { useCircuitMap } from '../../hooks/useApi';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CircuitMapCard() {
  const { state } = useRaceSession();

  // Extract the name from the circuit path e.g. /Images/F1_circuit/Abu_Dhabi_Circuit.avif -> Abu Dhabi
  const getCircuitName = (path: string) => {
    const filename = path.split('/').pop() || '';
    return filename.replace('_Circuit.avif', '').replace(/_/g, ' ').toUpperCase();
  };

  const currentCircuitName = state.selectedCircuit ? getCircuitName(state.selectedCircuit) : 'SELECT CIRCUIT';

  // Fetch the circuit map coordinates from backend using React Query
  const { data: circuitData, isLoading, isError } = useCircuitMap(
    state.selectedYear!,
    currentCircuitName
  );

  const [isProlongedLoad, setIsProlongedLoad] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isLoading) {
      timeout = setTimeout(() => {
        setIsProlongedLoad(true);
      }, 3000);
    } else {
      setIsProlongedLoad(false);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    <div className="flex-1 bg-[#0d0d0d] rounded-2xl border border-[var(--theme-30)] flex flex-col relative min-h-0 p-3 shadow-[0_0_15px_var(--theme-10)] hover:shadow-[0_0_25px_var(--theme-30)] transition-all duration-300 overflow-hidden">
      <h2 className="absolute top-5 left-5 z-20 text-[13px] font-f1 font-black uppercase tracking-[0.35em] text-[var(--theme-70)] flex items-center gap-2 drop-shadow-[0_0_8px_var(--theme-50)] whitespace-nowrap">
        Circuit Map {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : '• Live'}
      </h2>
      
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center z-10 relative mt-12">
         
          {/* Map Image / Loading */}
         <div className="w-full flex-1 flex items-center justify-center min-h-0">
            {state.selectedCircuit ? (
               <div className="relative w-full h-full flex items-center justify-center">
                 <img src={state.selectedCircuit} alt="Circuit Map" className="w-[95%] h-full object-contain filter invert opacity-80" />
                 {isLoading && isProlongedLoad && (
                   <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded border border-white/10 text-[8px] text-[var(--theme-70)] animate-pulse whitespace-nowrap">
                     Syncing telemetry...
                   </div>
                 )}
                 {isError && (
                   <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded border border-red-500/30 text-[8px] text-red-500 whitespace-nowrap">
                     Telemetry sync failed
                   </div>
                 )}
               </div>
            ) : (
               <div className="w-[80%] h-[80%] border border-dashed border-[var(--theme-20)] rounded-xl flex items-center justify-center bg-[var(--theme-10)]">
                  <span className="text-[var(--theme-40)] text-[10px] font-mono tracking-widest uppercase">Select Circuit</span>
               </div>
            )}
         </div>
         
         {/* Circuit Label */}
         <div className="flex flex-col items-center justify-end pb-1 shrink-0 mt-2">
            <span className="text-[7px] uppercase tracking-[0.2em] text-white/40 font-bold mb-0.5">Grand Prix</span>
            <div className="flex flex-col items-center gap-1">
               <div className="flex items-center gap-1.5 text-white font-black text-xs tracking-wider uppercase">
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 text-[var(--theme-base)] animate-spin" />
                  ) : isError ? (
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red]"></div>
                  ) : circuitData?.coordinates ? (
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_green]"></div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[var(--theme-base)] animate-pulse shadow-[0_0_8px_var(--theme-50)]"></div> 
                  )}
                  {currentCircuitName}
               </div>
               {isLoading && isProlongedLoad && (
                  <span className="text-[8px] text-[var(--theme-50)] animate-pulse text-center leading-tight">
                    Syncing live telemetry...
                  </span>
               )}
            </div>
         </div>

      </div>
    </div>
  );
}
