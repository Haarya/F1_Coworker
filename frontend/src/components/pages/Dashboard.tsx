import React, { useMemo } from 'react';
import LiveTerminal from '../transcript/LiveTerminal';
import LapPenaltyCard from '../prediction/LapPenaltyCard';
import { DriverStressMeter } from '../stress/DriverStressMeter';
import UploadAudioCard from '../shared/UploadAudioCard';
import DriverAnalyticsCard from '../stress/DriverAnalyticsCard';
import CircuitMapCard from '../prediction/CircuitMapCard';
import { usePlayback } from '../../hooks/usePlayback';
import { useClipSync } from '../../hooks/useClipSync';
import ActiveInterceptOverlay from '../stress/ActiveInterceptOverlay';
import Sidebar from '../layout/Sidebar';
import { useRaceSession } from '../../context/RaceSessionContext';

export default function Dashboard() {
  usePlayback();
  useClipSync();
  const { state } = useRaceSession();

  const themeVars = useMemo(() => {
    const hex = state.driverGlowHex || '#E60012';
    return {
      '--theme-base': hex,
      '--theme-10': `${hex}1A`,
      '--theme-20': `${hex}33`,
      '--theme-30': `${hex}4D`,
      '--theme-40': `${hex}66`,
      '--theme-50': `${hex}80`,
      '--theme-60': `${hex}99`,
      '--theme-70': `${hex}B3`,
      '--theme-80': `${hex}CC`,
      '--theme-90': `${hex}E6`,
    } as React.CSSProperties;
  }, [state.driverGlowHex]);

  return (
    <div className="h-screen w-screen bg-[#050505] overflow-hidden flex font-sans" style={themeVars}>
      <ActiveInterceptOverlay />
      
      {/* Left Sidebar Navigation */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col p-4 pl-0 relative min-h-0 overflow-hidden">
        
        {/* Dashboard Grid - 3 Columns */}
        <div className="flex-1 flex gap-4 min-h-0 relative z-10 w-full max-w-[1920px] mx-auto p-4 pt-0">
          
          {/* Left Column (Team Radio & Upload Audio) */}
          <div className="w-[22%] flex flex-col gap-4 min-h-0 h-full">
            <div className="flex-[2] min-h-0 bg-[#0d0d0d] rounded-2xl overflow-hidden border border-[var(--theme-30)] relative shadow-[0_0_15px_var(--theme-10)] hover:shadow-[0_0_25px_var(--theme-30)] transition-all duration-300">
              <h2 className="absolute top-4 left-5 z-10 text-[10px] font-bold uppercase tracking-widest text-[var(--theme-70)] flex items-center gap-2 drop-shadow-[0_0_8px_var(--theme-50)]">
                 <span className="text-[var(--theme-base)] text-xs animate-pulse">((•))</span> Team Radio
              </h2>
              <div className="pt-14 w-full h-full p-2">
                <LiveTerminal />
              </div>
            </div>
            
            <div className="flex-[1] min-h-0 flex flex-col">
              <UploadAudioCard />
            </div>
          </div>
          
          {/* Center Column (Stress Tachometer & Analytics Row) */}
          <div className="flex-1 flex flex-col gap-4 min-h-0 h-full">
            
            {/* Stress Level */}
            <div className="flex-[2] bg-[#0d0d0d] rounded-2xl border border-[var(--theme-30)] flex flex-col relative min-h-0 overflow-hidden shadow-[0_0_15px_var(--theme-10)] hover:shadow-[0_0_25px_var(--theme-30)] transition-all duration-300">
              <DriverStressMeter stressScore={state.currentCLIndex || 0} />
            </div>
            
            {/* Bottom Row (Penalty Model & Driver Analytics) */}
            <div className="flex-[1] flex gap-4 min-h-0">
               <div className="flex-[1] min-h-0 flex flex-col">
                 <LapPenaltyCard />
               </div>
               <div className="flex-[1.3] min-h-0 flex flex-col">
                 <DriverAnalyticsCard />
               </div>
            </div>
          </div>
          
          {/* Right Column (Circuit Map & Driver Portrait) */}
          <div className="w-[22%] flex flex-col gap-4 min-h-0 h-full">
            
            {/* Circuit Map */}
            <div className="flex-[1.3] min-h-0 flex flex-col">
               <CircuitMapCard />
            </div>
            
            {/* Driver Portrait Card */}
            <div className="flex-[1.5] rounded-2xl border-2 flex flex-col relative overflow-hidden shadow-[0_0_15px_var(--theme-10)] hover:shadow-[0_0_25px_var(--theme-30)] transition-all duration-500"
                 style={{ 
                   borderColor: 'var(--theme-40)', 
                   boxShadow: '0 0 25px var(--theme-20)',
                   backgroundColor: 'var(--theme-10)'
                 }}>
                 
               {state.selectedDriver ? (
                  <>
                     <div className="absolute inset-0 z-0 opacity-20" style={{ background: `linear-gradient(to top, var(--theme-base) 0%, transparent 100%)` }}></div>
                     <img src={state.selectedDriver} alt="Driver" className="w-full h-full object-cover object-center relative z-10 transition-transform duration-700 hover:scale-105 origin-bottom" />
                  </>
               ) : (
                  <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-white/10 m-4 rounded-xl bg-white/5">
                     <span className="text-white/30 text-[10px] font-mono tracking-widest uppercase">Select Driver</span>
                  </div>
               )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
