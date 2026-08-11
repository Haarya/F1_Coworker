import { Heart, Cloud, Brain, Lock, Loader2 } from 'lucide-react';
import { useRaceSession } from '../../context/RaceSessionContext';
import { useTelemetryLaps, useDriverStress } from '../../hooks/useApi';

export default function DriverAnalyticsCard() {
  const { state } = useRaceSession();
  
  // Use React Query to fetch backend telemetry laps
  const { data: laps, isLoading: isLapsLoading, isError: isLapsError } = useTelemetryLaps(
    state.selectedYear!,
    state.selectedCircuit!,
    state.selectedDriver!
  );

  // Fetch real ML stress from Wav2Vec2 via backend
  const { data: stressResult, isLoading: isStressLoading, isError: isStressError } = useDriverStress("sample_radio");

  // Derive score from real ML or fallback
  const score = stressResult?.cognitive_load ?? state.currentCLIndex ?? 80.4;
  
  // Determine primary emotion from ML result
  let emotion = "Angry";
  let category = "CRITICAL";
  
  if (stressResult?.emotions && stressResult?.zone) {
      // Find the max emotion from the dictionary
      const maxEmotion = Object.entries(stressResult.emotions).reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b);
      emotion = maxEmotion[0].charAt(0).toUpperCase() + maxEmotion[0].slice(1);
      category = stressResult.zone.toUpperCase();
  } else {
      if (score < 40) {
        emotion = "Focused";
        category = "OPTIMAL";
      } else if (score < 75) {
        emotion = "Tense";
        category = "ELEVATED";
      }
  }

  const isLoading = isLapsLoading || isStressLoading;
  const isError = isLapsError || isStressError;

  return (
    <div className="flex-1 bg-[#0d0d0d] rounded-2xl overflow-hidden border border-[var(--theme-30)] relative shadow-[0_0_15px_var(--theme-10)] hover:shadow-[0_0_25px_var(--theme-30)] transition-all duration-300 flex flex-col p-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10 relative">
         <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-base)] drop-shadow-[0_0_8px_var(--theme-50)]">
            Driver Analytics
         </h2>
         <div className="bg-black/50 border border-white/10 px-2 py-1 rounded flex items-center gap-1.5 backdrop-blur-sm shrink-0">
            <span className="text-[9px] uppercase tracking-wider text-white/80 font-semibold">Locked In</span>
            <Lock className="w-2.5 h-2.5 text-white/80" />
            <span className="text-[9px] text-white/50 ml-1 font-mono">• 11s</span>
         </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
        </div>
      ) : isError ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 text-xs text-center">Failed to load analytics</p>
        </div>
      ) : (
        /* Analytics Rows */
        <div className="flex-1 flex flex-col justify-center gap-4 z-10 relative px-1">
           
           {/* Row 1 */}
           <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-[var(--theme-base)] fill-[var(--theme-base)]" strokeWidth={1.5} />
              <div className="text-[11px] tracking-wide whitespace-nowrap">
                 <span className="text-white/80 font-light">Primary Emotion: </span>
                 <span className="text-[var(--theme-base)] font-semibold">{emotion}</span>
              </div>
           </div>
           
           {/* Row 2 */}
           <div className="flex items-center gap-3">
              <Cloud className="w-4 h-4 text-[var(--theme-base)] fill-[var(--theme-20)]" strokeWidth={1.5} />
              <div className="text-[11px] tracking-wide whitespace-nowrap">
                 <span className="text-white/80 font-light">Cognitive Load Score: </span>
                 <span className="text-[var(--theme-base)] font-semibold">{score.toFixed(1)}</span>
              </div>
           </div>
           
           {/* Row 3 */}
           <div className="flex items-center gap-3">
              <Brain className="w-4 h-4 text-[var(--theme-base)] fill-[var(--theme-20)]" strokeWidth={1.5} />
              <div className="text-[11px] tracking-wide whitespace-nowrap">
                 <span className="text-white/80 font-light">Stress Level Category: </span>
                 <span className="text-[var(--theme-base)] font-semibold">{category}</span>
              </div>
           </div>
  
        </div>
      )}
      
    </div>
  );
}
