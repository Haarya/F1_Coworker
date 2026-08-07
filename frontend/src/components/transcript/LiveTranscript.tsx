import { useEffect, useRef } from 'react';
import { useRaceSession } from '../../context/RaceSessionContext';
import TranscriptLine from './TranscriptLine';
import { AlignLeft } from 'lucide-react';

export default function LiveTranscript() {
  const { state } = useRaceSession();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter events that have happened up to the current playback timestamp
  const visibleEvents = state.radioEvents.filter(e => e.timestamp <= state.playbackTimestamp);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleEvents.length]);

  return (
    <div className="flex flex-col h-full bg-bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 border-b border-border flex items-center gap-2 bg-bg-dark shrink-0">
        <AlignLeft size={16} className="text-text-secondary" />
        <h2 className="font-semibold text-xs uppercase tracking-wider">Live Transcript</h2>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-bg-card"
      >
        {visibleEvents.map((event) => (
          <TranscriptLine key={event.id} event={event} />
        ))}
        {visibleEvents.length === 0 && (
          <div className="h-full flex items-center justify-center text-text-secondary text-sm italic">
            Waiting for radio transmissions...
          </div>
        )}
      </div>
    </div>
  );
}
