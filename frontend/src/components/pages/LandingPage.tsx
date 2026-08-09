import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, useProgress, Html } from '@react-three/drei';
import { Activity } from 'lucide-react';
import LandingScene from './LandingScene';

// Custom Loader component
function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center justify-center w-64">
        <div className="w-64 h-1 bg-white/10 rounded overflow-hidden mb-6">
          <div 
            className="h-full bg-[#E31D2B] transition-all duration-200" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm tracking-[0.2em] text-white/60 uppercase whitespace-nowrap">
          CALIBRATING TELEMETRY... {progress.toFixed(0)}%
        </p>
      </div>
    </Html>
  );
}

export default function LandingPage() {
  return (
    <div className="h-screen w-full bg-[#080808] font-sans selection:bg-[#E31D2B] selection:text-white overflow-hidden relative">
      
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0.5, 3.5], fov: 45 }}>
        <Suspense fallback={<Loader />}>
          <ScrollControls pages={4} damping={0.2}>
            <LandingScene />

            {/* Scroll-synced HTML Overlays */}
            <Scroll html style={{ width: '100%', height: '100%' }}>
              {/* Page 1 (Top) */}
              <div className="h-screen w-full flex items-center justify-start px-10 md:px-24 pointer-events-none">
                <div className="border-l-4 border-[#E31D2B] pl-6 mt-[30vh]">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white/95 mb-4 uppercase drop-shadow-lg font-f1">
                    BEYOND THE APEX.
                  </h2>
                  <p className="text-lg md:text-xl text-white/60 font-medium tracking-wide max-w-md drop-shadow-md">
                    Analyzing driver cognitive load and biometric stress in real-time.
                  </p>
                </div>
              </div>

              {/* Page 2 */}
              <div className="h-screen w-full flex items-center justify-end px-10 md:px-24 pointer-events-none">
                <div className="border-r-4 border-[#E31D2B] pr-6 mt-[20vh] text-right">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white/95 mb-4 uppercase drop-shadow-lg font-f1">
                    PRECISION TELEMETRY.
                  </h2>
                  <p className="text-lg md:text-xl text-white/60 font-medium tracking-wide max-w-md drop-shadow-md">
                    Synchronizing physical vehicle physics with psychological strain.
                  </p>
                </div>
              </div>

              {/* Page 3 */}
              <div className="h-screen w-full flex items-center justify-start px-10 md:px-24 pointer-events-none">
                <div className="border-l-4 border-[#E31D2B] pl-6 mt-[20vh]">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white/95 mb-4 uppercase drop-shadow-lg font-f1">
                    PREDICTIVE INSIGHTS.
                  </h2>
                  <p className="text-lg md:text-xl text-white/60 font-medium tracking-wide max-w-md drop-shadow-md">
                    AI-driven models forecasting lap penalties before they happen.
                  </p>
                </div>
              </div>

              {/* Page 4 (Bottom) */}
              <div className="h-screen w-full flex flex-col items-center justify-start pt-32 pointer-events-auto pb-20">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white/95 mb-2 uppercase drop-shadow-lg font-f1">
                  THE PIT WALL AWAITS.
                </h2>
                <p className="text-md text-white/60 font-medium tracking-wide mb-8 drop-shadow-md">
                  Step into the Silent Co-Driver dashboard.
                </p>
                <a 
                  href="/dashboard"
                  className="inline-flex items-center gap-3 bg-[#E31D2B] hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(227,29,43,0.4)] hover:shadow-[0_0_30px_rgba(227,29,43,0.6)]"
                >
                  Enter Command Center
                  <Activity size={22} />
                </a>
              </div>
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>

    </div>
  );
}
