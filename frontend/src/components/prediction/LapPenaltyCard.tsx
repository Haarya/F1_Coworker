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
    <div className="w-full h-full bg-[#0d0d0d] border border-[var(--theme-30)] hover:border-[var(--theme-50)] rounded-2xl p-3 flex flex-col gap-2 shadow-[0_0_15px_var(--theme-10)] hover:shadow-[0_0_25px_var(--theme-30)] transition-all duration-300">
      
      <div className="flex justify-between items-center h-6">
        <h3 className="text-[10px] uppercase tracking-widest text-[var(--theme-70)] font-bold flex items-center drop-shadow-[0_0_8px_var(--theme-50)]">
          <TrendingUp size={14} className="mr-2 text-[var(--theme-base)]" />
          Predictive Penalty Model
        </h3>
        <span className={`text-[9px] bg-[var(--theme-10)] text-[var(--theme-base)] px-2 py-1 rounded font-bold border border-[var(--theme-30)] transition-opacity tracking-widest ${probability > 0.6 ? 'opacity-100 animate-pulse shadow-[0_0_10px_var(--theme-40)]' : 'opacity-0'}`}>
          HIGH RISK
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between gap-2 min-h-0">
        
        {/* Top row: Prob & Delta */}
        <div className="flex-1 flex items-stretch gap-2 w-full min-h-0">
          <div className="flex-1 bg-[#050505] border border-white/5 rounded-xl p-1 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--theme-10)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-[7px] text-white/50 mb-1 uppercase tracking-widest text-center font-bold">Probability of Penalty</div>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className={`text-2xl font-black font-mono tracking-tighter ${probability > 0.6 ? 'text-[var(--theme-base)] drop-shadow-[0_0_10px_var(--theme-50)]' : probability > 0.4 ? 'text-yellow-500' : 'text-white/80'}`}>
                {(probability * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          
          <div className="flex-1 bg-[#050505] border border-white/5 rounded-xl p-1 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--theme-10)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-[7px] text-white/50 mb-1 uppercase tracking-widest text-center font-bold">
               Predicted Delay
            </div>
            <div className="text-xl font-black font-mono text-white mt-1 relative z-10 tracking-tighter">
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
