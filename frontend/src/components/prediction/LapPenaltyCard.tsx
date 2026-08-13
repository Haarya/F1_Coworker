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

      <div className="flex-1 flex flex-col justify-center items-center gap-2 min-h-0 pt-14 pb-2 px-2 opacity-50">
        <AlertTriangle size={24} className="text-white/30" />
        <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono text-center">
          Awaiting Penalty<br/>Model Data
        </span>
      </div>
    </div>
  );
}
