import { useRaceSession } from '../../context/RaceSessionContext';
import RadioEventCard from './RadioEventCard';

export default function RadioEventList() {
  const { state } = useRaceSession();

  return (
    <div className="flex-1 overflow-y-auto space-y-3 p-2 custom-scrollbar">
      {state.radioEvents.map((event) => (
        <RadioEventCard 
          key={event.id}
          event={event}
          isActive={state.activeEventId === event.id}
          onClick={() => {
            // In a real app, this might seek the playback to this event's timestamp
            console.log('Seek to', event.timestamp);
          }}
        />
      ))}
      {state.radioEvents.length === 0 && (
        <div className="text-center text-text-secondary text-sm p-4">
          No radio events for this session.
        </div>
      )}
    </div>
  );
}
