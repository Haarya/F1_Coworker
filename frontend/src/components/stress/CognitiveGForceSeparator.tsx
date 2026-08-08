import { useRaceSession } from '../../context/RaceSessionContext';

export default function CognitiveGForceSeparator() {
  const { state } = useRaceSession();
  
  // Normalize values for UI bars (assuming gLat max 5G, sPsych max 100)
  const gForcePercent = Math.min(100, Math.max(0, (Math.abs(state.currentGLat) / 5) * 100));
  const psychPercent = Math.min(100, Math.max(0, state.currentSPsych));

  return (
    <div className="flex gap-4 p-4 border-t border-border mt-2 bg-bg-hover">
      {/* Physical Strain (G-Force) */}
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-text-secondary">Physical Strain (G)</span>
          <span className="font-mono text-accent-red">{state.currentGLat.toFixed(1)}G</span>
        </div>
        <div className="h-2 bg-bg-dark rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-red transition-all duration-300"
            style={{ width: `${gForcePercent}%` }}
          />
        </div>
      </div>

      {/* Psychological Frustration */}
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-text-secondary">Psychological</span>
          <span className="font-mono text-orange-500">{Math.round(state.currentSPsych)}</span>
        </div>
        <div className="h-2 bg-bg-dark rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${psychPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
