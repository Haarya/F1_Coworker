import { useRaceSession } from '../../context/RaceSessionContext';
import { useLapPenaltyMutation } from '../../hooks/useApi';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LapPenaltyCard() {
  const { state } = useRaceSession();
  
  const getCircuitName = (path: string) => {
    if (!path) return 'Bahrain';
    const filename = path.split('/').pop() || '';
    const raw = filename.replace('_Circuit.avif', '').replace(/_/g, ' ');
    return raw.replace(/\w\S*/g, (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  };
  const gpName = getCircuitName(state.selectedCircuit || '');

  const driverMapping: Record<string, string> = {
    'Max': 'VER', 'Lewis': 'HAM', 'Charles': 'LEC', 'Sergio': 'PER',
    'Lando': 'NOR', 'Carlos': 'SAI', 'George': 'RUS', 'Oscar': 'PIA',
    'Fernando': 'ALO', 'Lance': 'STR'
  };
  const rawDriverName = state.selectedDriver?.split('/').pop()?.split('_')[0] || 'Max';
  const driverName = driverMapping[rawDriverName] || rawDriverName;

  // Removed useTelemetryLaps to avoid Ergast blocking

  // Use the active radio event or latest available from state.radioEvents
  const activeRadio = state.activeEventId 
    ? state.radioEvents.find(e => e.id === state.activeEventId) 
    : (state.radioEvents.length > 0 ? state.radioEvents[state.radioEvents.length - 1] : null);
  
  const lapPenaltyMutation = useLapPenaltyMutation();
  const [prediction, setPrediction] = useState<{probability: number, delta_seconds: number, sector: number} | null>(null);

  useEffect(() => {
    console.log('[LapPenaltyCard] useEffect triggered', { activeRadio, isExecuting: state.isExecuting });
    // Only send prediction when real data is loaded (Execute was clicked)
    if (activeRadio && state.isExecuting) {
      const latestLap = null; // Removed laps dependency
      console.log('[LapPenaltyCard] Executing mutation');
      
      const features = {
        cognitive_load: activeRadio.cognitiveLoad || (activeRadio as any).cognitive_load || 50,
        s_psych: ((activeRadio.cognitiveLoad || 50) / 100) * 2,  // derived stress index
        emotion_angry: activeRadio.emotions?.angry || 0,
        emotion_fearful: activeRadio.emotions?.fearful || 0,
        speed: latestLap?.lap_time ? 200 : 200,
        throttle: 80,
        brake: 0,
        g_lat: 1.5,
        sector: 2,
        lap_progress: 0.5,
        tyre_life: 15,
        tyre_compound: 'MEDIUM',
        track_status: '1'
      };

      lapPenaltyMutation.mutate(features, {
        onSuccess: (data) => {
          console.log('[LapPenaltyCard] Mutation Success', data);
          setPrediction(data);
        },
        onError: (err) => {
          console.error('[LapPenaltyCard] Mutation Error', err);
        }
      });
    }
  }, [activeRadio, state.isExecuting]);
  
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

      {prediction ? (
        <div className="flex-1 flex flex-col justify-center gap-2 min-h-0 pt-14 pb-2 px-2">
          {/* Top row: Prob & Delta */}
          <div className="flex-1 flex items-stretch justify-center gap-3 w-full">
            <div className="flex-1 h-full bg-[#050505] border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[var(--theme-10)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="text-[9px] text-white/50 mb-1 uppercase tracking-widest text-center font-bold">Probability</div>
              <div className="text-2xl xl:text-3xl font-f1 font-black text-[var(--theme-base)] drop-shadow-[0_0_10px_var(--theme-50)] mt-1 relative z-10 tracking-tighter">
                {(prediction.probability * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="flex-1 h-full bg-[#050505] border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[var(--theme-10)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="text-[9px] text-white/50 mb-1 uppercase tracking-widest text-center font-bold">
                 Predicted Delay
              </div>
              <div className="text-2xl xl:text-3xl font-f1 font-black text-[var(--theme-base)] drop-shadow-[0_0_10px_var(--theme-50)] mt-1 relative z-10 tracking-tighter">
                +{prediction.delta_seconds.toFixed(2)}s
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center gap-2 min-h-0 pt-14 pb-2 px-2 opacity-50">
          <AlertTriangle size={24} className="text-white/30" />
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono text-center">
            Awaiting Penalty<br/>Model Data
          </span>
        </div>
      )}
    </div>
  );
}
