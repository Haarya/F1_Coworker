import type { RadioEvent } from '../../types';

interface TranscriptLineProps {
  event: RadioEvent;
}

export default function TranscriptLine({ event }: TranscriptLineProps) {
  // Determine if this is the driver speaking based on the driverId
  // For the mock, we assume 'GP' is the engineer (Gianpiero)
  const isDriver = event.driverId !== 'GP';
  
  return (
    <div className={`mb-4 flex flex-col ${isDriver ? 'items-start' : 'items-end'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
          isDriver 
            ? 'bg-accent-red/20 text-accent-red border border-accent-red/50' 
            : 'bg-blue-900/50 text-blue-400 border border-blue-500/50'
        }`}>
          {event.driverId}
        </span>
        <span className="text-xs text-text-secondary font-mono">
          {event.timestamp.toFixed(1)}s
        </span>
      </div>
      
      <div className={`p-3 rounded-lg max-w-[90%] text-sm shadow-md backdrop-blur-sm ${
        isDriver 
          ? 'bg-bg-dark/80 border border-border text-text-primary rounded-tl-none border-l-2 border-l-accent-red' 
          : 'bg-bg-card/80 border border-border text-text-secondary rounded-tr-none border-r-2 border-r-blue-500'
      }`}>
        {event.transcript}
      </div>
      
      {/* Emotion breakdown (micro visualization gradient) */}
      <div className="flex w-32 h-1.5 rounded-full overflow-hidden opacity-80 mt-1.5 border border-black/20 shadow-inner bg-bg-card">
        <div style={{ width: `${event.emotions.angry * 100}%` }} className="bg-gradient-to-r from-red-600 to-red-400" title="Angry" />
        <div style={{ width: `${event.emotions.fearful * 100}%` }} className="bg-gradient-to-r from-purple-600 to-purple-400" title="Fearful" />
        <div style={{ width: `${event.emotions.happy * 100}%` }} className="bg-gradient-to-r from-green-600 to-green-400" title="Happy" />
        <div style={{ width: `${event.emotions.neutral * 100}%` }} className="bg-gradient-to-r from-gray-600 to-gray-400" title="Neutral" />
      </div>
    </div>
  );
}
