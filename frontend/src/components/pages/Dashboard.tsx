import TopBar from '../layout/TopBar';
import BroadcastTelemetry from '../telemetry/BroadcastTelemetry';
import LiveTerminal from '../transcript/LiveTerminal';
import LapPenaltyCard from '../prediction/LapPenaltyCard';
import CognitiveLoadTachometer from '../stress/CognitiveLoadTachometer';
import DynamicStressTrackMap from '../telemetry/DynamicStressTrackMap';
import { usePlayback } from '../../hooks/usePlayback';
import { useClipSync } from '../../hooks/useClipSync';
import ActiveInterceptOverlay from '../stress/ActiveInterceptOverlay';

export default function Dashboard() {
  usePlayback();
  useClipSync();

  return (
    <div className="h-screen w-screen bg-[#080808] overflow-hidden flex flex-col">
      <ActiveInterceptOverlay />
      
      {/* Top Command Ribbon */}
      <TopBar />
      
      {/* Main content area */}
      <div className="flex-1 p-6 relative min-h-0">
        
        {/* Dashboard Grid */}
        <div className="w-full h-full grid grid-cols-12 gap-6 pointer-events-auto">
          
          {/* Left Column (3) */}
          <div className="col-span-3 flex flex-col gap-6 min-h-0 h-full">
            <div className="flex-shrink-0">
              <LapPenaltyCard />
            </div>
            <div className="flex-1 min-h-0">
              <LiveTerminal />
            </div>
          </div>
          
          {/* Center Column (6) - Focal Point */}
          <div className="col-span-6 flex flex-col bg-[#141414] border border-[#333] rounded-xl overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] min-h-0 h-full relative">
            <h2 className="absolute top-4 left-0 w-full text-center z-10 text-xs font-bold uppercase tracking-widest text-text-secondary">Biometric Stress</h2>
            <div className="flex-1 w-full h-full pt-12 pb-4">
              <CognitiveLoadTachometer />
            </div>
          </div>
          
          {/* Right Column (3) */}
          <div className="col-span-3 flex flex-col gap-6 min-h-0 h-full">
            <div className="flex-[1.5] w-full bg-[#141414] border border-[#333] rounded-xl overflow-hidden flex flex-col relative min-h-0">
              <h2 className="absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-widest text-[#E31D2B] bg-black/50 px-2 py-1 rounded">Live Track Position</h2>
              <div className="flex-1 w-full relative min-h-0">
                <DynamicStressTrackMap />
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <BroadcastTelemetry />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
