import React from 'react';
import { motion } from 'framer-motion';

// Mock context hook if needed, or take props
// import { useRaceSession } from '../../context/RaceSessionContext';

interface DriverEmotionProps {
  focus?: number;
  aggression?: number;
  frustration?: number;
  calm?: number;
}

const RadarChart = ({ focus, aggression, frustration, calm }: { focus: number, aggression: number, frustration: number, calm: number }) => {
  const center = 100;
  const radius = 70;
  
  const getPoint = (value: number, angleDeg: number) => {
     const rad = (angleDeg * Math.PI) / 180;
     const r = (value / 100) * radius;
     return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  };
  
  const getPath = (f: number, a: number, fr: number, c: number) => {
     const p1 = getPoint(f, -90); // Top
     const p2 = getPoint((f+a)/2, -30); // Top-Right
     const p3 = getPoint(a, 30); // Bottom-Right
     const p4 = getPoint(fr, 90); // Bottom
     const p5 = getPoint(c, 150); // Bottom-Left
     const p6 = getPoint((f+c)/2, 210); // Top-Left
     return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} L ${p5.x} ${p5.y} L ${p6.x} ${p6.y} Z`;
  };
  
  const drawGrid = (level: number) => {
     return <path d={getPath(level, level, level, level)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
  };

  const points = [ 
    getPoint(focus, -90), 
    getPoint((focus+aggression)/2, -30), 
    getPoint(aggression, 30), 
    getPoint(frustration, 90), 
    getPoint(calm, 150), 
    getPoint((focus+calm)/2, 210) 
  ];

  return (
    <div className="relative w-full max-w-[150px] aspect-square flex items-center justify-center shrink-0">
       <svg width="200" height="200" viewBox="0 0 200 200" className="absolute inset-0">
          {drawGrid(25)}
          {drawGrid(50)}
          {drawGrid(75)}
          {drawGrid(100)}
          
          {/* Axes Lines */}
          {[ -90, -30, 30, 90, 150, 210 ].map((angle, i) => {
             const edge = getPoint(100, angle);
             return <line key={i} x1="100" y1="100" x2={edge.x} y2={edge.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
          })}
          
          {/* Data Polygon */}
          <motion.path 
             initial={false}
             animate={{ d: getPath(focus, aggression, frustration, calm) }}
             transition={{ duration: 0.6, type: 'spring' }}
             fill="rgba(153, 0, 0, 0.25)" 
             stroke="#990000" 
             strokeWidth="1.5"
             style={{ filter: 'drop-shadow(0px 0px 6px rgba(153, 0, 0, 0.5))' }}
          />

          {/* Data Nodes */}
          {points.map((pt, i) => (
             <motion.circle 
                key={i} 
                initial={false}
                animate={{ cx: pt.x, cy: pt.y }}
                transition={{ duration: 0.6, type: 'spring' }}
                r="2.5" 
                fill="#cc0000" 
             />
          ))}
       </svg>
       
    </div>
  );
};

const SegmentedBar = ({ label, value, color }: { label: string, value: number, color: 'white' | 'crimson' }) => {
  const segments = 10;
  const activeCount = Math.round((value / 100) * segments);
  
  const activeColor = color === 'white' ? '#e5e5e5' : '#990000';
  const inactiveColor = '#222225';

  return (
    <div className="flex flex-col gap-1 w-full mb-3 last:mb-0">
      <div className="text-[9px] text-white/50 uppercase tracking-[0.2em]">{label}</div>
      <div className="flex items-center gap-3 w-full">
         <div className="flex gap-[3px] flex-1 w-full min-w-0">
           {Array.from({length: segments}).map((_, i) => {
              const isActive = i < activeCount;
              return (
                 <motion.div 
                   key={i} 
                   className="w-full h-2 rounded-[1px]"
                   initial={false}
                   animate={{ 
                      backgroundColor: isActive ? activeColor : inactiveColor,
                      boxShadow: isActive ? `0 0 6px ${activeColor}40` : 'none'
                   }}
                   transition={{ duration: 0.3, delay: i * 0.02 }}
                 />
              )
           })}
         </div>
         <div className="w-10 text-right font-mono text-base font-bold text-white/90">{value}%</div>
      </div>
    </div>
  );
};

export const DriverEmotion: React.FC<DriverEmotionProps> = ({ 
   focus = 82, 
   aggression = 64, 
   frustration = 38, 
   calm = 21 
}) => {
  return (
    <div className="w-full flex-shrink-0 min-h-0 bg-[#1A1A1E] rounded-2xl border border-gray-800 border-t-white/10 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] flex flex-col p-3 overflow-hidden relative">
       
       {/* Header & Status Badge */}
       <div className="flex flex-row items-center justify-between z-10 mb-3">
          <h2 className="text-[9px] text-white/50 uppercase tracking-widest font-semibold mr-2 shrink-0">Driver Emotion</h2>
          <div className="flex items-center gap-2 shrink-0">
             <div className="flex items-center gap-2 bg-[#26262B] border border-white/10 px-2 py-1 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] font-black text-white tracking-widest uppercase">Locked In</span>
                <div className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </div>
             </div>
             <span className="text-[9px] text-white/40 font-mono tracking-widest">91%</span>
          </div>
       </div>

       {/* Two-Column Layout */}
       <div className="flex-1 flex flex-row items-start justify-between gap-4 z-10 w-full mt-2">
          
          {/* Left: Radar Chart */}
          <div className="w-[45%] max-w-[120px] flex justify-center items-start shrink-0 pt-1">
             <RadarChart focus={focus} aggression={aggression} frustration={frustration} calm={calm} />
          </div>

          {/* Right: Linear Metrics */}
          <div className="w-[55%] flex flex-col justify-start min-w-[100px]">
             <SegmentedBar label="Focus" value={focus} color="white" />
             <SegmentedBar label="Aggression" value={aggression} color="crimson" />
             <SegmentedBar label="Frustration" value={frustration} color="crimson" />
             <SegmentedBar label="Calm" value={calm} color="white" />
          </div>

       </div>
    </div>
  );
};

export default DriverEmotion;
