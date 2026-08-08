import { Play, Pause, FastForward, Settings2 } from 'lucide-react';
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
    <div className="flex items-stretch bg-gradient-to-b from-[#222] to-[#111] border border-[#444] rounded-lg overflow-hidden mr-4 shadow-lg h-10">
      
      {/* Play/Pause Button */}
      <button 
        onClick={() => dispatch({ type: 'TOGGLE_PLAYBACK' })}
        className={`px-5 transition-all duration-300 flex items-center justify-center border-r border-[#333] ${
          state.playbackState === 'playing' 
            ? 'bg-gradient-to-b from-[#E31D2B] to-[#b31420] text-white shadow-[0_0_15px_rgba(227,29,43,0.5)]' 
            : 'bg-transparent text-[#aaa] hover:text-white hover:bg-white/10'
        }`}
      >
        {state.playbackState === 'playing' ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>

      {/* Speed Toggle */}
      <button 
        onClick={handleSpeedToggle}
        className="px-4 border-r border-[#333] transition-colors flex items-center text-xs font-mono font-bold text-[#aaa] hover:text-white hover:bg-white/10"
      >
        <FastForward size={14} className={`mr-1 ${state.playbackSpeed > 1 ? 'text-[#00E676]' : 'opacity-70'}`} />
        <span className={state.playbackSpeed > 1 ? 'text-[#00E676]' : ''}>
          x{state.playbackSpeed}
        </span>
      </button>

      {/* Settings (Mock) */}
      <button className="px-3 border-r border-[#333] flex items-center text-[#777] hover:text-white hover:bg-white/10 transition-colors">
        <Settings2 size={14} />
      </button>

      {/* Timestamp Display */}
      <div className="px-5 flex items-center justify-center bg-black/60 min-w-[120px]">
        <span className="text-sm font-mono font-bold tracking-widest tabular-nums text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
          {formatTime(state.playbackTimestamp)}
        </span>
      </div>
    </div>
  );
}
