import { useState } from 'react';
import PlaybackControls from './PlaybackControls';

export default function TopBar() {
  const [activeDriver, setActiveDriver] = useState('LEC');
  const [activeGp, setActiveGp] = useState('Monza');

  return (
    <header className="bg-[#141414] border-b border-[#333] px-6 py-3 flex items-center justify-between w-full pointer-events-auto">
      
      {/* Left: Driver & GP Selectors */}
      <div className="flex gap-6 items-center">
        <div className="flex gap-2">
          {['LEC', 'SAI'].map(driver => (
            <button 
              key={driver}
              onClick={() => setActiveDriver(driver)}
              className={`px-3 py-1 rounded text-sm font-bold uppercase tracking-wider transition-colors ${
                activeDriver === driver 
                  ? 'bg-[#E10600] text-white shadow-[0_0_10px_rgba(225,6,0,0.5)]' 
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {driver}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex gap-2">
          {['Monza', 'Silverstone'].map(gp => (
            <button 
              key={gp}
              onClick={() => setActiveGp(gp)}
              className={`px-3 py-1 rounded text-sm font-bold uppercase tracking-wider transition-colors ${
                activeGp === gp 
                  ? 'text-white' 
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {gp}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Playback */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <PlaybackControls />
      </div>

      {/* Right: Branding */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-white font-bold tracking-widest uppercase text-sm">Command Center</span>
          <span className="text-[10px] text-text-secondary tracking-widest uppercase text-[#E10600]">Live Session</span>
        </div>
      </div>
    </header>
  );
}
