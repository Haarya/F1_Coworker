import type { RadioEvent } from '../../types';
import { Play } from 'lucide-react';

interface RadioEventCardProps {
  event: RadioEvent;
  isActive: boolean;
  onClick: () => void;
}

export default function RadioEventCard({ event, isActive, onClick }: RadioEventCardProps) {
  // Format timestamp (e.g. 70.2 -> "01:10.200")
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 1000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const getStressBadge = (cl: number) => {
    if (cl > 70) return 'bg-red-900/50 text-red-400 border-red-500/50';
    if (cl > 40) return 'bg-yellow-900/50 text-yellow-400 border-yellow-500/50';
    return 'bg-green-900/50 text-green-400 border-green-500/50';
  };

  const getStressText = (cl: number) => {
    if (cl > 70) return 'HIGH STRESS';
    if (cl > 40) return 'ELEVATED';
    return 'OPTIMAL';
  };

  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded border transition-colors cursor-pointer group flex flex-col gap-2 ${
        isActive 
          ? 'bg-bg-dark border-accent-red shadow-[0_0_10px_rgba(225,6,0,0.2)]' 
          : 'bg-bg-dark border-border hover:border-accent-red/50'
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-secondary font-mono">
          {formatTime(event.timestamp)}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase border ${getStressBadge(event.cognitiveLoad)}`}>
          {getStressText(event.cognitiveLoad)}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${
          isActive 
            ? 'bg-accent-red text-white shadow-[0_0_10px_rgba(225,6,0,0.5)]' 
            : 'bg-bg-card border border-border group-hover:border-accent-red text-text-secondary group-hover:text-white'
        }`}>
          <Play size={14} className="ml-0.5" />
        </button>
        
        {/* Fake waveform */}
        <div className="flex-1 h-3 flex items-center gap-[2px] overflow-hidden opacity-50">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-1 rounded-full ${isActive ? 'bg-accent-red' : 'bg-text-secondary'}`}
              style={{ 
                height: `${20 + Math.random() * 80}%`,
                animation: isActive ? `pulse 1s infinite alternate ${i * 0.1}s` : 'none' 
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Transcript snippet preview */}
      <p className="text-xs text-text-secondary truncate mt-1">
        "{event.transcript}"
      </p>
    </div>
  );
}
