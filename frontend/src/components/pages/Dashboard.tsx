import TopBar from '../layout/TopBar';
import SummaryBar from '../layout/SummaryBar';
import { useDashboardReveal } from '../../hooks/useDashboardReveal';
import { Settings2, BarChart2 } from 'lucide-react';
import RadioEventList from '../audio/RadioEventList';
import AudioPlayer from '../audio/AudioPlayer';
import LiveTranscript from '../transcript/LiveTranscript';
import CognitiveLoadTachometer from '../stress/CognitiveLoadTachometer';
import TelemetryChart from '../telemetry/TelemetryChart';
import DynamicStressTrackMap from '../telemetry/DynamicStressTrackMap';
import CarViewport from '../car/CarViewport';
import LapPenaltyCard from '../prediction/LapPenaltyCard';
import ActiveInterceptOverlay from '../stress/ActiveInterceptOverlay';
import { usePlayback } from '../../hooks/usePlayback';

export default function Dashboard() {
  useDashboardReveal();
  usePlayback();

  return (
    <div className="h-screen bg-bg-dark text-text-primary flex flex-col overflow-hidden relative">
      <ActiveInterceptOverlay />

      <TopBar />

      <main className="flex-1 dashboard-grid p-4 overflow-hidden overflow-y-auto">
        
        {/* Radio Panel */}
        <section className="grid-card radio-panel flex flex-col p-0">
          <div className="panel-header px-4 pt-4 pb-2">
            <Settings2 size={18} className="text-accent-red" />
            <h2 className="panel-title">Radio Events</h2>
          </div>
          <RadioEventList />
          <AudioPlayer />
        </section>

        {/* Stress Gauge */}
        <section className="grid-card stress-gauge flex flex-col">
          <div className="panel-header px-4 pt-4 pb-0 border-none">
            <h2 className="panel-title mx-auto text-center">Cognitive Load</h2>
          </div>
          <CognitiveLoadTachometer />
        </section>

        {/* Transcript Panel */}
        <section className="grid-card transcript p-0 bg-transparent border-none">
          <LiveTranscript />
        </section>

        {/* Telemetry Chart & Map */}
        <section className="grid-card telemetry flex p-0 overflow-hidden">
          <div className="flex-[2] flex flex-col relative">
            <div className="panel-header absolute top-0 left-0 right-0 z-10 px-4 pt-4 pb-0 border-none bg-transparent">
              <BarChart2 size={18} className="text-accent-red" />
              <h2 className="panel-title">Telemetry</h2>
            </div>
            <div className="flex-1 pt-12 pb-4 px-4">
              <TelemetryChart />
            </div>
          </div>
          <div className="flex-1">
            <DynamicStressTrackMap />
          </div>
        </section>

        {/* Car Prediction Panel */}
        <section className="grid-card car-prediction p-0 overflow-hidden flex gap-4 bg-transparent border-none">
          <div className="flex-[2]">
            <CarViewport />
          </div>
          <div className="flex-1">
            <LapPenaltyCard />
          </div>
        </section>

      </main>

      <SummaryBar />
    </div>
  );
}
