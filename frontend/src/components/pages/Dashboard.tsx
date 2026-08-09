import LiveTerminal from '../transcript/LiveTerminal';
import LapPenaltyCard from '../prediction/LapPenaltyCard';
import { DriverStressMeter } from '../stress/DriverStressMeter';
import DriverEmotion from '../stress/DriverEmotion';
import { usePlayback } from '../../hooks/usePlayback';
import { useClipSync } from '../../hooks/useClipSync';
import ActiveInterceptOverlay from '../stress/ActiveInterceptOverlay';
import Sidebar from '../layout/Sidebar';
import { useRaceSession } from '../../context/RaceSessionContext';

export default function Dashboard() {
  usePlayback();
  useClipSync();
  const { state } = useRaceSession();

  // Extract the name from the circuit path e.g. /Images/F1_circuit/Abu_Dhabi_Circuit.avif -> Abu Dhabi
  const getCircuitName = (path: string) => {
    const filename = path.split('/').pop() || '';
    return filename.replace('_Circuit.avif', '').replace('_', ' ');
  };

  const currentCircuitName = state.selectedCircuit ? getCircuitName(state.selectedCircuit) : '';

  return (
    <div className="h-screen w-screen bg-[#050505] overflow-hidden flex font-sans">
      <ActiveInterceptOverlay />
      
      {/* Left Sidebar Navigation */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col p-4 pl-0 relative min-h-0 overflow-hidden">
        
        {/* Dashboard Grid - 3 Columns */}
        <div className="flex-1 flex gap-4 min-h-0 relative z-10 w-full max-w-[1920px] mx-auto p-4 pt-0">
          
          {/* Left Column (Team Radio & Predictive Penalty) */}
          <div className="w-[22%] flex flex-col gap-4 min-h-0 h-full">
            <div className="flex-1 min-h-0 bg-[#0d0d0d] rounded-2xl overflow-hidden border border-[#E60012]/30 relative shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:shadow-[0_0_20px_rgba(230,0,18,0.15)] transition-all duration-300">
              <h2 className="absolute top-4 left-5 z-10 text-[10px] font-bold uppercase tracking-widest text-[#E60012]/70 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(230,0,18,0.5)]">
                 <span className="text-[#E60012] text-xs animate-pulse">((•))</span> Team Radio
              </h2>
              <div className="pt-14 w-full h-full p-2">
                <LiveTerminal />
              </div>
            </div>
            
            <div className="flex-shrink-0 h-[240px]">
              <LapPenaltyCard />
            </div>
          </div>
          
          {/* Center Column (Stress Tachometer & Track Map) */}
          <div className="flex-1 flex flex-col gap-4 min-h-0 h-full">
            
            {/* Stress Level */}
            <div className="flex-[2] bg-[#0d0d0d] rounded-2xl border border-[#E60012]/30 flex flex-col relative min-h-0 overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:shadow-[0_0_25px_rgba(230,0,18,0.15)] transition-all duration-300">
              <DriverStressMeter stressScore={state.currentCLIndex || 0} />
            </div>
            
            {/* Track Map */}
            <div className="flex-[1] bg-[#0d0d0d] rounded-2xl border border-[#E60012]/30 flex flex-col relative min-h-0 p-5 shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:shadow-[0_0_25px_rgba(230,0,18,0.15)] transition-all duration-300 overflow-hidden">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#E60012]/70 mb-3 drop-shadow-[0_0_8px_rgba(230,0,18,0.5)] absolute top-5 left-5 z-20">Circuit Map • Live</h2>
              
              <div className="flex-1 w-full h-full flex flex-row items-center justify-between z-10 relative">
                 {/* Map Image */}
                 <div className="flex-[1.5] h-full flex items-center justify-center p-4">
                    {state.selectedCircuit ? (
                       <img src={state.selectedCircuit} alt="Circuit Map" className="w-full h-full object-contain filter invert opacity-80" />
                    ) : (
                       <div className="w-full h-full border border-dashed border-[#E60012]/20 rounded-xl flex items-center justify-center bg-[#E60012]/5">
                          <span className="text-[#E60012]/40 text-[10px] font-mono tracking-widest uppercase">Select Circuit</span>
                       </div>
                    )}
                 </div>
                 
                 {/* Track Stats Block */}
                 <div className="flex-1 h-full flex flex-col justify-center pl-4 border-l border-white/5">
                    <div className="mb-4">
                       <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold block mb-1">Grand Prix</span>
                       <div className="flex items-center gap-1 text-white font-black text-xl tracking-wide uppercase">
                          <span className="text-[#E60012]">O</span> {currentCircuitName || 'None'}
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-[#151515] border border-white/5 p-2 rounded flex flex-col">
                          <span className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Lap</span>
                          <span className="text-white font-mono text-sm font-bold">35 / 78</span>
                       </div>
                       <div className="bg-[#151515] border border-white/5 p-2 rounded flex flex-col">
                          <span className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Sector</span>
                          <span className="text-white font-mono text-sm font-bold">3</span>
                       </div>
                       <div className="bg-[#151515] border border-white/5 p-2 rounded flex flex-col">
                          <span className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Track Temp</span>
                          <span className="text-white font-mono text-sm font-bold">44°C</span>
                       </div>
                       <div className="bg-[#151515] border border-white/5 p-2 rounded flex flex-col">
                          <span className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Grip</span>
                          <span className="text-white font-mono text-sm font-bold">High</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Right Column (Emotion & Driver Portrait) */}
          <div className="w-[30%] flex flex-col gap-4 min-h-0 h-full">
            
            {/* Emotion Card */}
            <DriverEmotion />
            
            {/* Driver Portrait Card */}
            <div className="flex-1 rounded-2xl border-2 flex flex-col relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-all duration-500"
                 style={{ 
                   borderColor: state.driverGlowHex ? `${state.driverGlowHex}66` : '#333', 
                   boxShadow: state.driverGlowHex ? `0 0 30px ${state.driverGlowHex}33` : 'none',
                   backgroundColor: state.driverGlowHex ? `${state.driverGlowHex}11` : '#0d0d0d'
                 }}>
                 
               {state.selectedDriver ? (
                  <>
                     <div className="absolute inset-0 z-0 opacity-20" style={{ background: `linear-gradient(to top, ${state.driverGlowHex} 0%, transparent 100%)` }}></div>
                     <img src={state.selectedDriver} alt="Driver" className="w-full h-full object-cover object-[center_top] relative z-10 transition-transform duration-700 hover:scale-105 origin-bottom" />
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
