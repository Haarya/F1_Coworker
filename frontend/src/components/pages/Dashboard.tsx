import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Settings2, BarChart2, Activity } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="h-screen bg-bg-dark text-text-primary flex flex-col overflow-hidden">
      {/* TopBar */}
      <header className="h-16 border-b border-border bg-bg-card flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-text-secondary hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="text-accent-red" size={24} />
            <span className="font-bold text-lg tracking-wide uppercase">Command Center</span>
          </div>
        </div>
        
        {/* Mock Selectors */}
        <div className="flex gap-4">
          <select className="bg-bg-dark border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-accent-red">
            <option>VER - Max Verstappen</option>
            <option>LEC - Charles Leclerc</option>
            <option>HAM - Lewis Hamilton</option>
          </select>
          <select className="bg-bg-dark border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-accent-red">
            <option>2024 Australian GP</option>
            <option>2024 Japanese GP</option>
          </select>
          <select className="bg-bg-dark border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-accent-red">
            <option>Lap 1</option>
            <option>Lap 2</option>
            <option>Lap 3</option>
          </select>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-4 p-4 overflow-hidden">
        
        {/* Column 1: SidePanel (Events + Audio) */}
        <section className="col-span-1 row-span-2 bg-bg-card rounded-lg border border-border flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Settings2 size={18} className="text-accent-red" />
            <h2 className="font-semibold text-sm uppercase tracking-wider">Radio Events</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {/* Mock Event Cards */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-bg-dark p-3 rounded border border-border hover:border-accent-red/50 cursor-pointer transition-colors group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-text-secondary font-mono">00:0{i}.450</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${i % 2 === 0 ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                    {i % 2 === 0 ? 'High Stress' : 'Optimal'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 rounded-full bg-accent-red flex items-center justify-center hover:bg-accent-red-hover text-white transition-colors">
                    <Play size={14} className="ml-0.5" />
                  </button>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent-red/30 w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Column 2: Transcript & Gauge */}
        <section className="col-span-1 row-span-1 bg-bg-card rounded-lg border border-border flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-48 h-48 rounded-full border-8 border-border relative flex items-center justify-center shadow-[0_0_30px_rgba(225,6,0,0.1)]">
              {/* Mock Needle */}
              <div className="absolute bottom-1/2 left-1/2 w-1 h-20 bg-accent-red origin-bottom -translate-x-1/2 rotate-45 transition-transform duration-1000"></div>
              {/* Center dot */}
              <div className="w-6 h-6 rounded-full bg-bg-card border-4 border-accent-red z-10"></div>
              <div className="absolute -bottom-8 text-center">
                <div className="text-3xl font-bold text-white">78</div>
                <div className="text-xs text-text-secondary uppercase tracking-widest mt-1">CL Index</div>
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-1 row-span-1 bg-bg-card rounded-lg border border-border flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-sm uppercase tracking-wider">Live Transcript</h2>
          </div>
          <div className="flex-1 p-6 font-mono text-lg overflow-y-auto flex items-end">
            <p className="text-white">
              <span className="text-accent-red mr-2">&gt;</span>
              "Mate, the rears are completely gone. I have no grip in turn 3!"
            </p>
          </div>
        </section>

        {/* Column 3: Telemetry & Car */}
        <section className="col-span-1 row-span-1 bg-bg-card rounded-lg border border-border flex items-center justify-center">
          <div className="text-center">
            <BarChart2 size={32} className="text-border mx-auto mb-3" />
            <p className="text-text-secondary text-sm">Telemetry Chart Placeholder</p>
          </div>
        </section>

        <section className="col-span-1 row-span-1 bg-bg-card rounded-lg border border-border flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-red/10 via-bg-card to-bg-card"></div>
           <div className="text-center z-10">
            <p className="text-text-secondary text-sm uppercase tracking-widest border border-border px-4 py-2 rounded-full bg-bg-dark/80 backdrop-blur-sm">
              3D Car Model Ready
            </p>
          </div>
        </section>
      </main>

      {/* SummaryBar */}
      <footer className="h-12 border-t border-border bg-bg-card flex items-center justify-between px-6 text-xs text-text-secondary shrink-0">
        <div className="flex gap-8">
          <span>Sector 1: <strong className="text-white">28.450</strong></span>
          <span>Sector 2: <strong className="text-white">22.100</strong></span>
          <span>Sector 3: <strong className="text-accent-red">31.850</strong></span>
        </div>
        <div>
          Last Update: Live
        </div>
      </footer>
    </div>
  );
}
