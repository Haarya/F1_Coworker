import { useRaceSession } from '../../context/RaceSessionContext';
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react';

export default function LapPenaltyCard() {
  const { state } = useRaceSession();
  
  // For Phase 3, we'll simulate a penalty prediction based on CL Index.
  // In a real app, this comes from state.lapPenaltyPrediction populated by the backend.
  const clIndex = state.currentCLIndex;
  
  // Simple mock logic: if CL > 70, high probability of penalty
  const probability = clIndex > 80 ? 0.85 : clIndex > 60 ? 0.45 : 0.05;
  const delta = (probability * 0.4).toFixed(2); // e.g., 0.34s
  
  return (
    <div className="w-full h-full bg-bg-dark border border-border/50 rounded-lg p-4 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs uppercase tracking-widest text-text-secondary font-bold flex items-center">
          <TrendingUp size={14} className="mr-2" />
          Predictive Penalty Model
        </h3>
        {probability > 0.6 && (
          <span className="text-[10px] bg-red-900/50 text-red-400 px-2 py-0.5 rounded font-bold border border-red-500/50 animate-pulse">
            HIGH RISK
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <div className="text-xs text-text-secondary mb-1">Probability of Error</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-mono font-bold ${probability > 0.6 ? 'text-accent-red' : probability > 0.4 ? 'text-yellow-500' : 'text-green-500'}`}>
                {(probability * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="flex-1 border-l border-border pl-3">
            <div className="text-xs text-text-secondary mb-1 flex items-center gap-1">
              <Clock size={12} /> Predicted Delta
            </div>
            <div className="text-2xl font-mono text-white">
              +{delta}s
            </div>
          </div>
        </div>

        <div className="bg-bg-card rounded p-2 text-xs text-text-secondary border border-border">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
            <p>
              {probability > 0.6 
                ? "Elevated cognitive load in braking zones correlates strongly with track limit violations."
                : "Driver is currently operating within optimal cognitive bounds. Low error risk."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
