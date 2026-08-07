import { Link } from 'react-router-dom';

export default function SummaryBar() {
  return (
    <footer className="h-12 border-t border-border bg-bg-card flex items-center justify-between px-6 text-xs text-text-secondary shrink-0 summary-bar z-10 relative">
      <div className="flex gap-8">
        <span>Sector 1: <strong className="text-white">--.---</strong></span>
        <span>Sector 2: <strong className="text-white">--.---</strong></span>
        <span>Sector 3: <strong className="text-accent-red">--.---</strong></span>
      </div>
      <div className="flex items-center gap-4">
        <span>Last Update: Live</span>
        <Link 
          to="/dashboard/stint/1" 
          className="bg-bg-dark border border-border px-3 py-1 rounded hover:bg-border transition-colors text-white hover:text-accent-red cursor-pointer flex items-center gap-2"
        >
          View Stint Deep-Dive &rarr;
        </Link>
      </div>
    </footer>
  );
}
