import React, { useMemo, useRef, useEffect } from 'react';
import LiveTerminal from '../transcript/LiveTerminal';
import LapPenaltyCard from '../prediction/LapPenaltyCard';
import { DriverStressMeter } from '../stress/DriverStressMeter';
import DriverAnalyticsCard from '../stress/DriverAnalyticsCard';
import CircuitMapCard from '../prediction/CircuitMapCard';
import IMOAssistantCard from '../ai/IMOAssistantCard';
import { usePlayback } from '../../hooks/usePlayback';
import { useClipSync } from '../../hooks/useClipSync';
import ActiveInterceptOverlay from '../stress/ActiveInterceptOverlay';
import { useRaceSession } from '../../context/RaceSessionContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useTelemetryStream, useRadioEvents } from '../../hooks/useApi';

export default function Dashboard() {
  usePlayback();
  useClipSync();
  const { state, dispatch } = useRaceSession();
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract gpName from selectedCircuit (e.g. "/Images/F1_circuit/Bahrain_Circuit.avif" -> "Bahrain")
  // Must be Title Case to match FastF1 GP names and the radio DB
  const getCircuitName = (path: string) => {
    if (!path) return 'Bahrain';
    const filename = path.split('/').pop() || '';
    const raw = filename.replace('_Circuit.avif', '').replace(/_/g, ' ');
    // Title-case each word
    return raw.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  };
  const gpName = getCircuitName(state.selectedCircuit || '') || state.gpName || 'Bahrain';
  
  // Map driver image filenames to FastF1 3-letter abbreviations
  const driverMapping: Record<string, string> = {
    'Max': 'VER',
    'Lewis': 'HAM',
    'Charles': 'LEC',
    'Sergio': 'PER',
    'Lando': 'NOR',
    'Carlos': 'SAI',
    'George': 'RUS',
    'Oscar': 'PIA',
    'Fernando': 'ALO',
    'Lance': 'STR'
  };
  
  const rawDriverName = state.selectedDriver?.split('/').pop()?.split('_')[0] || 'Max';
  const driverName = driverMapping[rawDriverName] || rawDriverName;

  // Only fetch data when Execute is clicked to simulate processing delay
  const { data: telemetryData, isLoading: isTelemetryLoading } = useTelemetryStream(
    state.selectedYear || 2024,
    gpName,
    driverName,
    state.selectedSession || 'Race',
    state.isExecuting
  );

  const { data: radioData, isLoading: isRadioLoading } = useRadioEvents(
    driverName,
    gpName,
    state.isExecuting
  );

  // As soon as real data loads from the API, push it into context and start playback
  // Track whether we already loaded real data to avoid double-dispatch
  const hasLoadedData = useRef(false);

  // When Execute is clicked (isExecuting flips true) AND radio data is available, load it.
  // Using a ref so we handle the case where radioData was already fetched before Execute was clicked.
  useEffect(() => {
    if (state.isExecuting && !hasLoadedData.current) {
      const radio = radioData && radioData.length > 0 ? radioData : null;
      if (radio && telemetryData) {
        hasLoadedData.current = true;
        const telemetry = telemetryData.data || [];
        dispatch({ type: 'LOAD_REAL_DATA', payload: { telemetry, radio } });
        // Auto-start playback after a short delay to let state settle
        setTimeout(() => dispatch({ type: 'TOGGLE_PLAYBACK' }), 200);
      }
    }
    // Reset if isExecuting is turned off
    if (!state.isExecuting) {
      hasLoadedData.current = false;
    }
  }, [state.isExecuting, radioData, telemetryData, dispatch]);

  useGSAP(() => {
    gsap.fromTo('.gsap-bento',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.03, duration: 0.6, ease: 'power4.out' }
    );
  }, { scope: containerRef });

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
    <div className="flex-1 h-full w-full flex font-neue relative z-0" style={themeVars}>
      <ActiveInterceptOverlay />
      
      {/* Main content area */}
      <div ref={containerRef} className="flex-1 flex flex-col p-4 pl-0 relative min-h-0 overflow-hidden">
        
        {/* Dashboard Grid - 3 Columns */}
        <div className="flex-1 flex gap-4 min-h-0 relative z-10 w-full max-w-[1920px] mx-auto p-4 pt-0">
          
          {/* Left Column (Team Radio) */}
          <div className="w-[22%] flex flex-col gap-4 min-h-0 h-full">
            <div className="gsap-bento flex-[1.5] min-h-0 bg-[#0d0d0d] rounded-2xl overflow-hidden border border-[var(--theme-30)] relative shadow-[0_0_15px_var(--theme-10)] hover:shadow-[0_0_25px_var(--theme-30)] transition-all duration-300">
              <h2 className="absolute top-5 left-5 z-20 text-[13px] font-f1 font-black uppercase tracking-[0.35em] text-[var(--theme-70)] flex items-center gap-2 drop-shadow-[0_0_8px_var(--theme-50)] whitespace-nowrap">
                 <span className="text-[var(--theme-base)] text-xs animate-pulse">((•))</span> Team Radio
              </h2>
              <div className="pt-16 w-full h-full p-2 pb-4">
                <LiveTerminal />
              </div>
            </div>
            <IMOAssistantCard />
          </div>
          
          {/* Center Column (Stress Tachometer & Analytics Row) */}
          <div className="flex-1 flex flex-col gap-4 min-h-0 h-full">
            
            {/* Stress Level */}
            <div className="gsap-bento flex-[2] bg-[#0d0d0d] rounded-2xl border border-[var(--theme-30)] flex flex-col relative min-h-0 overflow-hidden shadow-[0_0_15px_var(--theme-10)] hover:shadow-[0_0_25px_var(--theme-30)] transition-all duration-300">
              <DriverStressMeter stressScore={state.currentCLIndex || 0} />
            </div>
            
            {/* Bottom Row (Penalty Model & Driver Analytics) */}
            <div className="flex-[1] flex gap-4 min-h-0">
               <div className="gsap-bento flex-[1] min-h-0 flex flex-col">
                 <LapPenaltyCard />
               </div>
               <div className="gsap-bento flex-[1.3] min-h-0 flex flex-col">
                 <DriverAnalyticsCard />
               </div>
            </div>
          </div>
          
          {/* Right Column (Circuit Map & Driver Portrait) */}
          <div className="w-[22%] flex flex-col gap-4 min-h-0 h-full">
            
            {/* Circuit Map */}
            <div className="gsap-bento flex-[1.3] min-h-0 flex flex-col">
               <CircuitMapCard />
            </div>
            
            {/* Driver Portrait Card */}
            <div className="gsap-bento flex-[1.5] rounded-2xl border-2 flex flex-col relative overflow-hidden shadow-[0_0_25px_var(--theme-20)] hover:shadow-[0_0_40px_var(--theme-40)] transition-all duration-500"
                 style={{ 
                   borderColor: 'var(--theme-40)', 
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
