import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PresentationControls, Environment, ContactShadows } from '@react-three/drei';

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
    <div className="w-6 text-[9px] font-mono font-bold text-white/40 text-center">
      {labels[index] || ''}
    </div>
  );
};

const ChevronGauge = ({ side, score }: { side: 'left' | 'right', score: number }) => {
  const segments = 12;
  const activeCount = Math.round((score / 100) * segments);
  
  return (
    <div className={`flex flex-col gap-[5px] ${side === 'left' ? 'items-end' : 'items-start'}`}>
      {Array.from({ length: segments }).map((_, i) => {
        // Segments fill from bottom (i=11) to top (i=0)
        const isActive = (segments - 1 - i) < activeCount; 
        
        // Middle segments stick out the furthest to form the chevron point
        const distanceToCenter = Math.abs(5.5 - i);
        const offsetX = distanceToCenter * 8; // Adjust slope steepness
        
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
                width: '65px',
                height: '12px',
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
  const [fakeScore, setFakeScore] = React.useState(stressScore || 0);

  React.useEffect(() => {
    // Generate a random stress score between 10 and 95 every 2.5 seconds to test animation
    const interval = setInterval(() => {
       setFakeScore(Math.floor(Math.random() * 85) + 10);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[450px] bg-[#090909] rounded-2xl border border-white/5 overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
    
      {/* Centered & 25px Uplift Wrapper */}
      <div className="absolute top-0 left-1/2 w-full h-full -translate-x-1/2 -translate-y-[25px]">
      
        {/* Header (visually corrected for letter-spacing) */}
        <h2 className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 z-20 text-center pl-[0.3em] whitespace-nowrap">
          Driver Stress Level
        </h2>

        {/* Center Readout & Radar Reticle */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none mb-10">
          
          {/* Reticle Rings */}
          <svg className="absolute w-[280px] h-[280px] opacity-10" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="1 3" />
             <circle cx="50" cy="50" r="35" fill="none" stroke="white" strokeWidth="0.2" />
             {/* Crosshairs */}
             <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.1" />
             <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.1" />
          </svg>
          
          {/* Digital Readout */}
          <div className="flex flex-col items-center justify-center relative z-20 bg-[#090909]/60 w-[120px] h-[120px] rounded-full backdrop-blur-sm border border-white/5">
            <motion.span 
              className="text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
              key={fakeScore}
              initial={{ scale: 1.1, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {Math.round(fakeScore)}
            </motion.span>
            <span className="text-[9px] text-white/40 tracking-[0.2em] mt-1 font-bold pl-[0.2em]">/ 100</span>
          </div>
        </div>

        {/* Gauges Container */}
        <div className="absolute inset-0 flex justify-between items-center px-12 z-10 pointer-events-none mb-10">
           <ChevronGauge side="left" score={fakeScore} />
           <ChevronGauge side="right" score={fakeScore} />
        </div>

        {/* 3D Car Stage */}
        <div className="absolute bottom-0 w-full h-[60%] z-30">
           
           {/* Floor Glow (Red Ambient Light) */}
           <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--theme-30)] via-[var(--theme-10)] to-transparent blur-3xl pointer-events-none"></div>
           
           {/* Concentric Stage Rings */}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[60%] h-[40px] border border-white/10 rounded-full opacity-20 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>
           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[75%] h-[50px] border border-white/5 rounded-full opacity-20 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>

           {/* R3F Canvas */}
           <Canvas camera={{ position: [0, 1.5, 6], fov: 45 }}>
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
