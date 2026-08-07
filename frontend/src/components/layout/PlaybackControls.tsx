import { Play, Pause, FastForward } from 'lucide-react';
import { useRaceSession } from '../../context/RaceSessionContext';

export default function PlaybackControls() {
  const { state, dispatch } = useRaceSession();
  
  // Format timestamp (e.g. 70.2 -> "01:10.200")
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 1000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const handleSpeedToggle = () => {
    const nextSpeed = state.playbackSpeed === 1 ? 2 : state.playbackSpeed === 2 ? 4 : 1;
    dispatch({ type: 'SET_SPEED', payload: nextSpeed as 1 | 2 | 4 });
  };

  return (
    <div className="flex items-center gap-2 bg-bg-dark border border-border rounded px-2 py-1 mr-4">
      <button 
        onClick={() => dispatch({ type: 'TOGGLE_PLAYBACK' })}
        className="p-1 hover:text-accent-red text-text-secondary transition-colors"
      >
        {state.playbackState === 'playing' ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button 
        onClick={handleSpeedToggle}
        className="p-1 hover:text-accent-red text-text-secondary transition-colors flex items-center text-xs font-mono"
      >
        <FastForward size={14} className="mr-1" />
        x{state.playbackSpeed}
      </button>
      <div className="ml-2 pl-2 border-l border-border text-xs font-mono text-white tabular-nums">
        {formatTime(state.playbackTimestamp)}
      </div>
    </div>
  );
}
