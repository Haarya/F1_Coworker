import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import BroadcastTelemetry from '../telemetry/BroadcastTelemetry';
import LiveTerminal from '../transcript/LiveTerminal';

export default function StintDeepDive() {
  const { stintId } = useParams();

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-bg-card rounded-full transition-colors group">
              <ArrowLeft className="text-text-secondary group-hover:text-accent-red" />
            </Link>
            <div>
              <h1 className="text-2xl font-f1 tracking-widest uppercase">
                Stint {stintId} Deep Dive
              </h1>
              <p className="text-sm text-text-secondary font-mono mt-1">
                Laps 14-32 • Hard Compound • 18 Laps
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="glass-panel px-4 py-2 text-center">
              <div className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1">Avg Pace</div>
              <div className="font-mono text-white">1:24.310</div>
            </div>
            <div className="glass-panel px-4 py-2 text-center">
              <div className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1">Peak Stress</div>
              <div className="font-mono text-accent-red font-bold">88</div>
            </div>
          </div>
        </div>

        {/* Cinematic Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[300px]">
            <h2 className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-4 w-full text-left">Real-Time Telemetry</h2>
            <BroadcastTelemetry />
          </div>
          <div className="glass-panel p-6 flex flex-col justify-center min-h-[300px]">
            <h2 className="text-[10px] text-text-secondary uppercase tracking-widest font-bold w-full text-left">Live Radio Feed</h2>
            <div className="scale-90 origin-top-left h-full">
              <LiveTerminal />
            </div>
          </div>
        </div>

        {/* Lap Stress Heatmap */}
        <section className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-accent-red" />
            <h2 className="font-bold uppercase tracking-widest">Sector Stress Heatmap</h2>
          </div>
          
          <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
            <div className="p-2 text-text-secondary">Lap</div>
            <div className="p-2 text-text-secondary">S1</div>
            <div className="p-2 text-text-secondary">S2</div>
            <div className="p-2 text-text-secondary">S3</div>
            
            {/* Mock heatmap grid */}
            {[14, 15, 16, 17, 18].map(lap => (
              <React.Fragment key={lap}>
                <div className="p-2 bg-black/40 border border-white/5 text-white flex items-center justify-center">{lap}</div>
                <div className="p-2 bg-green-900/30 border border-green-500/20 text-green-400 flex items-center justify-center">21</div>
                <div className="p-2 bg-yellow-900/30 border border-yellow-500/20 text-yellow-400 flex items-center justify-center">45</div>
                <div className="p-2 bg-red-900/30 border border-red-500/20 text-red-400 flex items-center justify-center">82</div>
              </React.Fragment>
            ))}
          </div>
        </section>
        
      </div>
    </div>
  );
}

