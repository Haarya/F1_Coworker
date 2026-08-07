import { useRaceSession } from '../../context/RaceSessionContext';
import { Volume2, Loader2 } from 'lucide-react';

export default function AudioPlayer() {
  const { state } = useRaceSession();
  
  // Find the active event based on state.activeEventId
  const activeEvent = state.radioEvents.find(e => e.id === state.activeEventId);

  return (
    <div className="h-20 border-t border-border bg-bg-dark flex flex-col p-3 shrink-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-accent-red uppercase tracking-widest flex items-center gap-2">
          {state.playbackState === 'playing' ? (
            <Volume2 size={14} className="animate-pulse" />
          ) : (
            <Volume2 size={14} className="opacity-50" />
          )}
          Live Audio Feed
        </span>
        {activeEvent && (
          <span className="text-[10px] bg-bg-card px-2 py-0.5 rounded border border-border font-mono text-text-secondary">
            {activeEvent.driverId} RADIO
          </span>
        )}
      </div>
      
      {activeEvent ? (
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-text-secondary font-mono w-10">0:00</span>
            <div className="flex-1 h-1.5 bg-bg-card rounded-full overflow-hidden border border-border">
              {/* Fake progress bar moving based on playback */}
              <div 
                className="h-full bg-accent-red" 
                style={{ width: `${(state.playbackTimestamp % 10) * 10}%`, transition: 'width 0.1s linear' }}
              />
            </div>
            <span className="text-xs text-text-secondary font-mono w-10">0:10</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-text-secondary opacity-50 italic">
          <Loader2 size={12} className="animate-spin mr-2" />
          Waiting for transmission...
        </div>
      )}
    </div>
  );
}
