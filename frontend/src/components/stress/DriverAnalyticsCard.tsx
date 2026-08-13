import { Lock, Loader2 } from 'lucide-react';
import { useRaceSession } from '../../context/RaceSessionContext';
import { useTelemetryLaps } from '../../hooks/useApi';

export default function DriverAnalyticsCard() {
  const { state } = useRaceSession();
  
  const gpName = state.selectedCircuit?.split('/').pop()?.split('_')[0] || state.gpName || 'Monaco';
  
  const driverMapping: Record<string, string> = {
    'Max': 'VER', 'Lewis': 'HAM', 'Charles': 'LEC', 'Sergio': 'PER',
    'Lando': 'NOR', 'Carlos': 'SAI', 'George': 'RUS', 'Oscar': 'PIA',
    'Fernando': 'ALO', 'Lance': 'STR'
  };
  const rawDriverName = state.selectedDriver?.split('/').pop()?.split('_')[0] || 'Max';
  const driverName = driverMapping[rawDriverName] || rawDriverName;

  // Use React Query to fetch backend telemetry laps
  const { isLoading: isLapsLoading, isError: isLapsError } = useTelemetryLaps(
    state.selectedYear!,
    gpName,
    driverName
  );

  // Find the currently active radio event based on playback
  const activeRadio = state.radioEvents.find(r => r.id === state.activeEventId);

  // Derive score from active ML radio event or fallback
  const score = activeRadio?.cognitiveLoad ?? state.currentCLIndex ?? 80.4;
  
  // Determine primary emotion from ML result
  let emotion = "Angry";
  let category = "CRITICAL";
  
  if (activeRadio?.emotions) {
      const emotionsMap = activeRadio.emotions as unknown as Record<string, number>;
      const maxEmotion = Object.entries(emotionsMap).reduce((a, b) => a[1] > b[1] ? a : b);
      emotion = maxEmotion[0].charAt(0).toUpperCase() + maxEmotion[0].slice(1);
      category = (activeRadio as any).zone || "ELEVATED"; 
  } else {
      if (score < 40) {
        emotion = "Focused";
        category = "OPTIMAL";
      } else if (score < 75) {
        emotion = "Tense";
        category = "ELEVATED";
      } else {
        emotion = "Angry";
        category = "CRITICAL";
      }
  }

  const isLoading = isLapsLoading;
  const isError = isLapsError;

  return (
    <div className="flex-1 bg-[#0d0d0d] rounded-2xl overflow-hidden border border-[var(--theme-30)] relative shadow-[0_0_15px_var(--theme-10)] hover:shadow-[0_0_25px_var(--theme-30)] transition-all duration-300 flex flex-col p-5">
      
      {/* Header */}
      <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
         <h2 className="text-[13px] font-f1 font-black uppercase tracking-[0.35em] text-[var(--theme-70)] flex items-center gap-2 drop-shadow-[0_0_8px_var(--theme-50)] whitespace-nowrap">
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
      <div className="flex-1 flex flex-row gap-3 z-10 relative px-1 pt-8 pb-0 min-h-0">
         
         {/* Left: 1/3 - Cognitive Load Meter */}
         <div className="w-1/3 flex flex-col items-center bg-[#050505] rounded-xl border border-white/5 p-2 relative min-h-0 overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--theme-10)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <span className="text-[8px] uppercase tracking-wider text-white/70 font-semibold mb-1 text-center leading-tight relative z-10">
               Cognitive<br/>Load
            </span>
            
            <div className="flex-1 w-full flex flex-row justify-center gap-2 mt-1 min-h-0 relative z-10">
               {/* Numbers */}
               <div className="flex flex-col justify-between items-end text-[8px] font-mono text-white/40 h-full py-0.5">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
               </div>
               
               {/* Bar */}
               <div className="w-3 bg-white/5 rounded-full overflow-hidden h-full relative shadow-inner">
                  <div 
                     className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[var(--theme-20)] to-[var(--theme-base)] rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_var(--theme-50)]"
                     style={{ height: `${Math.min(100, Math.max(0, score))}%` }}
                  />
               </div>
            </div>
            
            {/* Score display */}
            <div className="mt-2 relative z-10">
               <span className="text-[12px] font-bold text-[var(--theme-base)] drop-shadow-[0_0_5px_var(--theme-50)] bg-black/40 px-2 py-0.5 rounded border border-white/10 font-mono">
                  {score.toFixed(1)}
               </span>
            </div>
         </div>

         {/* Right: 2/3 - Stacked Cards */}
         <div className="w-2/3 flex flex-col gap-2 min-h-0">
            
            {/* Top Card: Primary Emotion */}
            <div className="flex-1 bg-[#050505] border border-white/5 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group min-h-0">
               <div className="absolute inset-0 bg-[var(--theme-10)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="text-[9px] text-white/50 mb-0.5 uppercase tracking-widest text-center font-bold relative z-10">Primary Emotion</div>
               <div className="text-xl font-f1 font-black text-[var(--theme-base)] drop-shadow-[0_0_10px_var(--theme-50)] relative z-10 tracking-tighter uppercase">
                  {emotion}
               </div>
            </div>

            {/* Bottom Card: Stress Level Category */}
            <div className="flex-1 bg-[#050505] border border-white/5 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group min-h-0">
               <div className="absolute inset-0 bg-[var(--theme-10)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="text-[9px] text-white/50 mb-0.5 uppercase tracking-widest text-center font-bold relative z-10">Stress Level</div>
               <div className="text-lg font-f1 font-black text-[var(--theme-base)] drop-shadow-[0_0_10px_var(--theme-50)] relative z-10 tracking-tighter uppercase">
                  {category}
               </div>
            </div>

         </div>

      </div>
      )}
      
    </div>
  );
}
