import { useRaceSession } from '../../context/RaceSessionContext';
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react';

export default function LapPenaltyCard() {
  const { state } = useRaceSession();
  
  const clIndex = state.currentCLIndex;
  
  const probability = clIndex > 80 ? 0.85 : clIndex > 60 ? 0.45 : 0.05;
  const delta = (probability * 0.4).toFixed(2);
  
  return (
    <div className="w-full h-full bg-[#0d0d0d] border border-[#E60012]/30 hover:border-[#E60012]/50 rounded-2xl p-3 flex flex-col gap-2 shadow-[0_0_15px_rgba(230,0,18,0.15)] hover:shadow-[0_0_25px_rgba(230,0,18,0.3)] transition-all duration-300">
      
      <div className="flex justify-between items-center h-6">
        <h3 className="text-[10px] uppercase tracking-widest text-[#E60012]/70 font-bold flex items-center drop-shadow-[0_0_8px_rgba(230,0,18,0.5)]">
          <TrendingUp size={14} className="mr-2 text-[#E60012]" />
          Predictive Penalty Model
        </h3>
        <span className={`text-[9px] bg-[#E60012]/10 text-[#E60012] px-2 py-1 rounded font-bold border border-[#E60012]/30 transition-opacity tracking-widest ${probability > 0.6 ? 'opacity-100 animate-pulse shadow-[0_0_10px_rgba(230,0,18,0.4)]' : 'opacity-0'}`}>
          HIGH RISK
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between gap-2 min-h-0">
        
        {/* Top row: Prob & Delta */}
        <div className="flex-1 flex items-stretch gap-2 w-full min-h-0">
          <div className="flex-1 bg-[#050505] border border-white/5 rounded-xl p-1 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#E60012]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-[7px] text-white/50 mb-1 uppercase tracking-widest text-center font-bold">Probability of Penalty</div>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className={`text-2xl font-black font-mono tracking-tighter ${probability > 0.6 ? 'text-[#E31D2B] drop-shadow-[0_0_10px_rgba(227,29,43,0.5)]' : probability > 0.4 ? 'text-yellow-500' : 'text-white/80'}`}>
                {(probability * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          
          <div className="flex-1 bg-[#050505] border border-white/5 rounded-xl p-1 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#E60012]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-[7px] text-white/50 mb-1 uppercase tracking-widest text-center font-bold">
               Predicted Delay
            </div>
            <div className="text-xl font-black font-mono text-white mt-1 relative z-10 tracking-tighter">
              +{delta}s
            </div>
          </div>
        </div>

        {/* Warning Text Area */}
        <div className="bg-[#050505] rounded-xl p-2 text-xs text-white/60 border border-[#E60012]/20 flex items-start gap-2 relative overflow-hidden group shadow-[inset_0_0_15px_rgba(230,0,18,0.05)] shrink-0">
          <div className="absolute inset-0 bg-[#E60012]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <AlertTriangle size={16} className={`${probability > 0.6 ? 'text-[#E60012]' : 'text-yellow-500'} shrink-0 mt-0.5 relative z-10`} />
          <p className="leading-tight relative z-10 text-[9px]">
            <strong className="text-white tracking-wide">WARNING:</strong> Current cognitive load indicates an <strong className={`${probability > 0.6 ? 'text-[#E60012]' : 'text-yellow-500'}`}>{(probability * 100).toFixed(0)}% probability</strong> of a <strong className="text-white">+{delta}s penalty</strong> in Sector 3.
          </p>
        </div>
      </div>
    </div>
  );
}
