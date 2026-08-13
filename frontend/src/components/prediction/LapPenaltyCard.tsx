import { useRaceSession } from '../../context/RaceSessionContext';
import { useTelemetryLaps, useDriverStress, useLapPenaltyMutation } from '../../hooks/useApi';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LapPenaltyCard() {
  const { state } = useRaceSession();
  
  const { data: laps } = useTelemetryLaps(
    state.selectedYear!,
    state.selectedCircuit!,
    state.selectedDriver!
  );

  const { data: stressResult } = useDriverStress("sample_radio");
  
  const lapPenaltyMutation = useLapPenaltyMutation();
  const [prediction, setPrediction] = useState<{probability: number, delta_seconds: number, sector: number} | null>(null);

  useEffect(() => {
    if (stressResult) {
      // Build features object to send to the backend
      const latestLap = laps && laps.length > 0 ? laps[laps.length - 1] : null;
      
      const features = {
        cognitive_load: stressResult.cognitive_load,
        emotion_angry: stressResult.emotions?.angry || 0,
        emotion_fearful: stressResult.emotions?.fearful || 0,
        speed: latestLap?.Speed || 200,
        throttle: latestLap?.Throttle || 80,
        brake: latestLap?.Brake || 0,
        g_lat: 1.5,
        sector: latestLap?.Sector1Time ? (latestLap?.Sector2Time ? 3 : 2) : 1
      };

      lapPenaltyMutation.mutate(features, {
        onSuccess: (data) => {
          setPrediction(data);
        }
      });
    }
  }, [stressResult, laps]);
  
  const probability = prediction ? prediction.probability : 0.05;
  const delta = prediction ? prediction.delta_seconds.toFixed(2) : "0.00";
  const sector = prediction ? prediction.sector : 3;
  
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
        {/* Warning Text Area */}
        <div className="bg-[#050505] rounded-xl p-2 text-xs text-white/60 border border-[var(--theme-20)] flex items-start gap-2 relative overflow-hidden group shadow-[inset_0_0_15px_var(--theme-10)] shrink-0">
          <div className="absolute inset-0 bg-[var(--theme-10)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <AlertTriangle size={16} className={`${probability > 0.6 ? 'text-[var(--theme-base)]' : 'text-yellow-500'} shrink-0 mt-0.5 relative z-10`} />
          <p className="leading-tight relative z-10 text-[9px]">
            <strong className="text-white tracking-wide">WARNING:</strong> Current telemetry and stress indicates an <strong className={`${probability > 0.6 ? 'text-[var(--theme-base)]' : 'text-yellow-500'}`}>{(probability * 100).toFixed(0)}% probability</strong> of a <strong className="text-white">+{delta}s penalty</strong> in Sector {sector}.
          </p>
        </div>
      </div>
    </div>
  );
}
