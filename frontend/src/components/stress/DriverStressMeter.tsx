import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PresentationControls, Environment, ContactShadows } from '@react-three/drei';
import { useRaceSession } from '../../context/RaceSessionContext';
import { useTelemetryStream } from '../../hooks/useApi';

interface DriverStressMeterProps {
  stressScore: number;
}

const RedBullCar = () => {
  // Load the compressed Red Bull model
  const { scene } = useGLTF('/models/redbull.glb');
  const carRef = useRef<any>(null);
  
  useFrame((state) => {
    if (carRef.current) {
       // Gentle floating/breathing animation for the car
       carRef.current.position.y = -0.42 + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });
  
  return (
    <primitive 
      object={scene} 
      ref={carRef} 
      scale={1.5} 
      position={[0.36, -0.42, 0]} 
      rotation={[0, -Math.PI / 2, 0]} // Side profile
    />
  );
}

// Preload the model so it doesn't pop in
useGLTF.preload('/models/redbull.glb');

const Marker = ({ index }: { index: number }) => {
  const labels: Record<number, string> = {
    0: '100',
    3: '75',
    6: '50',
    9: '25',
    11: '0'
  };
  return (
    <div className="w-8 text-[11px] font-mono font-bold text-white/40 text-center">
      {labels[index] || ''}
    </div>
  );
};

const ChevronGauge = ({ side, score }: { side: 'left' | 'right', score: number }) => {
  const segments = 12;
  const activeCount = Math.round((score / 100) * segments);
  
  return (
    <div className={`flex flex-col gap-[10px] ${side === 'left' ? 'items-end' : 'items-start'}`}>
      {Array.from({ length: segments }).map((_, i) => {
        // Segments fill from bottom (i=11) to top (i=0)
        const isActive = (segments - 1 - i) < activeCount; 
        
        // Middle segments stick out the furthest to form the chevron point
        const distanceToCenter = Math.abs(5.5 - i);
        // dy = height(18) + gap(10) = 28. To match 30deg skew exactly: dx = 28 * tan(30deg)
        const slopeStep = 28 * Math.tan(30 * Math.PI / 180);
        const offsetX = distanceToCenter * slopeStep;
        
        // Skew creates the slanted edges
        let skewDeg = 0;
        if (side === 'left') {
           skewDeg = i < 6 ? -30 : 30;
        } else {
           skewDeg = i < 6 ? 30 : -30;
        }

        return (
          <div key={i} className="flex items-center gap-4">
            {side === 'left' && <Marker index={i} />}
            
            <motion.div
              style={{
                width: '80px',
                height: '18px',
                // Combine translation for the V-shape and skew for the slanted edges
                transform: `translateX(${side === 'left' ? offsetX : -offsetX}px) skewX(${skewDeg}deg)`,
              }}
              initial={false}
              animate={{
                 backgroundColor: isActive ? 'var(--theme-base)' : '#1a1a1a',
                 boxShadow: isActive ? '0 0 15px 2px var(--theme-70)' : '0 0 0px rgba(0,0,0,0)',
                 opacity: isActive ? 1 : 0.4,
                 borderColor: isActive ? 'var(--theme-base)' : '#333'
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="border-b border-r"
            />
            
            {side === 'right' && <Marker index={i} />}
          </div>
        );
      })}
    </div>
  );
};

export const DriverStressMeter: React.FC<DriverStressMeterProps> = ({ stressScore }) => {
  const { state } = useRaceSession();
  const getCircuitName = (path: string) => {
    const filename = path.split('/').pop() || '';
    return filename.replace('_Circuit.avif', '').replace(/_/g, ' ').toUpperCase();
  };
  const gpName = state.selectedCircuit ? getCircuitName(state.selectedCircuit) : '';

  const driverMapping: Record<string, string> = {
    'Max': 'VER', 'Lewis': 'HAM', 'Charles': 'LEC', 'Sergio': 'PER',
    'Lando': 'NOR', 'Carlos': 'SAI', 'George': 'RUS', 'Oscar': 'PIA',
    'Fernando': 'ALO', 'Lance': 'STR'
  };
  const rawDriverName = state.selectedDriver?.split('/').pop()?.split('_')[0] || 'Max';
  const driverName = driverMapping[rawDriverName] || rawDriverName;

  const { data: telemetryData } = useTelemetryStream(
    state.selectedYear!,
    gpName,
    driverName,
    state.selectedSession!
  );

  // Default to 0 or use the backend score. The backend stream response
  // might be a single data point or an array, assuming it's an object with cognitive_load for now
  // based on standard telemetry stream behavior.
  const score = telemetryData?.cognitive_load ?? stressScore ?? 0;

  return (
    <div className="relative w-full h-full min-h-[450px] bg-[#090909] rounded-2xl border border-white/5 overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
      {(!state.isExecuting || state.playbackTimestamp <= 16.5) && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-[#090909]/80 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white/30"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono text-center">
            Awaiting Telemetry<br/>& Stress Data
          </span>
        </div>
      )}
    
      {/* Centered Wrapper */}
      <div className="absolute top-0 left-1/2 w-full h-full -translate-x-1/2">
      
        {/* Header (visually corrected for letter-spacing) */}
        <h2 className="absolute top-5 left-1/2 -translate-x-1/2 text-[13px] font-f1 font-black uppercase tracking-[0.35em] text-[var(--theme-70)] z-20 flex items-center gap-2 drop-shadow-[0_0_8px_var(--theme-50)] whitespace-nowrap">
          Driver Stress Level
        </h2>

        {/* Center Readout & Radar Reticle */}
        <div className="absolute bottom-[20px] left-0 w-full h-[350px] flex items-center justify-center z-10 pointer-events-none">
          
          {/* Reticle Rings */}
          <svg className="absolute w-[350px] h-[350px] opacity-10" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="1 3" />
             <circle cx="50" cy="50" r="35" fill="none" stroke="white" strokeWidth="0.2" />
             {/* Crosshairs */}
             <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.1" />
             <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.1" />
          </svg>
          
          {/* Digital Readout */}
          <div className="flex flex-col items-center justify-center relative z-20 bg-[#090909]/60 w-[150px] h-[150px] rounded-full backdrop-blur-sm border border-white/5">
            <motion.span 
              className="text-[75px] leading-none font-f1 font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
              key={score}
              initial={{ scale: 1.1, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {Math.round(score)}
            </motion.span>
            <span className="text-[11px] text-white/40 tracking-[0.2em] mt-1 font-bold pl-[0.2em]">/ 100</span>
          </div>
        </div>

        {/* Gauges Container */}
        <div className="absolute bottom-[20px] left-0 w-full h-[350px] flex justify-between items-center px-8 z-10 pointer-events-none">
           <ChevronGauge side="left" score={score} />
           <ChevronGauge side="right" score={score} />
        </div>

        {/* 3D Car Stage */}
        <div className="absolute bottom-[-65px] w-full h-[60%] z-30">
           
           {/* Floor Glow (Red Ambient Light) */}
           <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[100%] h-[75%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--theme-30)] via-[var(--theme-10)] to-transparent blur-3xl pointer-events-none"></div>
           
           {/* Concentric Stage Rings */}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[75%] h-[50px] border border-white/10 rounded-full opacity-20 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>
           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] h-[60px] border border-white/5 rounded-full opacity-20 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>

           {/* R3F Canvas */}
           <Canvas camera={{ position: [0, 1.5, 6], fov: 36 }}>
             <React.Suspense fallback={null}>
               <ambientLight intensity={0.6} />
               <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
               <spotLight position={[0, 5, 0]} intensity={3} angle={0.6} penumbra={1} color="#ffffff" />
               
               <Environment preset="city" />
               
               <PresentationControls global rotation={[0, 0, 0]} polar={[-0.05, 0.1]} azimuth={[-0.3, 0.3]}>
                  <RedBullCar />
                  <ContactShadows position={[0.36, -0.62, 0]} opacity={0.8} scale={10} blur={2.5} far={4} />
               </PresentationControls>
             </React.Suspense>
           </Canvas>
        </div>
      </div>
    </div>
  );
};
