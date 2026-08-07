import { Link } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';
import { useRaceSession } from '../../context/RaceSessionContext';
import PlaybackControls from './PlaybackControls';

export default function TopBar() {
  const { state, dispatch } = useRaceSession();

  return (
    <header className="h-16 border-b border-border bg-bg-card flex items-center justify-between px-6 shrink-0 topbar">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-text-secondary hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <Activity className="text-accent-red" size={24} />
          <span className="font-bold text-lg tracking-wide uppercase">Command Center</span>
        </div>
      </div>
      
      <div className="flex gap-4 items-center">
        <PlaybackControls />
        
        <select 
          className="bg-bg-dark border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-accent-red"
          value={state.driverId || ''}
          onChange={(e) => dispatch({ type: 'SET_DRIVER', payload: e.target.value })}
        >
          <option value="VER">VER - Max Verstappen</option>
          <option value="LEC">LEC - Charles Leclerc</option>
        </select>
        <select 
          className="bg-bg-dark border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-accent-red"
          value={state.gpName || ''}
          onChange={(e) => dispatch({ type: 'SET_GP', payload: e.target.value })}
        >
          <option value="2024 Australian GP">2024 Australian GP</option>
          <option value="2024 Japanese GP">2024 Japanese GP</option>
        </select>
        <select 
          className="bg-bg-dark border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-accent-red"
          value={state.currentLap || 1}
          onChange={(e) => dispatch({ type: 'SET_LAP', payload: parseInt(e.target.value) })}
        >
          {state.availableLaps.map(lap => (
            <option key={lap} value={lap}>Lap {lap}</option>
          ))}
        </select>
      </div>
    </header>
  );
}
