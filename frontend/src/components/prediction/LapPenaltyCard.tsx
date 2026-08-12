import { useRaceSession } from '../../context/RaceSessionContext';
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react';

export default function LapPenaltyCard() {
  const { state } = useRaceSession();
  
  const clIndex = state.currentCLIndex;
  
  const probability = clIndex > 80 ? 0.85 : clIndex > 60 ? 0.45 : 0.05;
  const delta = (probability * 0.4).toFixed(2);
  
  return (
    <div className="w-full h-full bg-[#0d0d0d] border border-[var(--theme-30)] hover:border-[var(--theme-50)] rounded-2xl p-3 flex flex-col gap-2 shadow-[0_0_15px_var(--theme-10)] hover:shadow-[0_0_25px_var(--theme-30)] transition-all duration-300 relative">
      
      {/* Header */}
      <div className="absolute top-5 left-0 w-full flex justify-center z-20">
        <h2 className="text-[13px] font-f1 font-black uppercase tracking-[0.35em] text-[var(--theme-70)] flex items-start gap-2 drop-shadow-[0_0_8px_var(--theme-50)] leading-tight">
          <TrendingUp className="w-4 h-4 text-[var(--theme-base)] shrink-0 mt-0.5" />
          <span className="whitespace-nowrap text-left">Predictive Penalty<br/>Model</span>
        </h2>
      </div>
      <div className="absolute top-5 right-5 z-20">
        <span className={`text-[9px] bg-[var(--theme-10)] text-[var(--theme-base)] px-2 py-1 rounded font-bold border border-[var(--theme-30)] transition-opacity tracking-widest ${probability > 0.6 ? 'opacity-100 animate-pulse shadow-[0_0_10px_var(--theme-40)]' : 'opacity-0'}`}>
          HIGH RISK
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-2 min-h-0 pt-14 pb-2 px-2">
        
        {/* Top row: Prob & Delta */}
        <div className="flex-1 flex items-stretch justify-center gap-3 w-full">
          <div className="flex-1 h-full bg-[#050505] border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--theme-10)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-[9px] text-white/50 mb-1 uppercase tracking-widest text-center font-bold">Probability</div>
            <div className="text-2xl xl:text-3xl font-f1 font-black text-[var(--theme-base)] drop-shadow-[0_0_10px_var(--theme-50)] mt-1 relative z-10 tracking-tighter">
              {(probability * 100).toFixed(0)}%
            </div>
          </div>
          
          <div className="flex-1 h-full bg-[#050505] border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--theme-10)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-[9px] text-white/50 mb-1 uppercase tracking-widest text-center font-bold">
               Predicted Delay
            </div>
            <div className="text-2xl xl:text-3xl font-f1 font-black text-[var(--theme-base)] drop-shadow-[0_0_10px_var(--theme-50)] mt-1 relative z-10 tracking-tighter">
              +{delta}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
