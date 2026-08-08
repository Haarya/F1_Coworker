import { useRef } from 'react';
import { useRaceSession } from '../../context/RaceSessionContext';
import { useNeedleAnimation } from '../../hooks/useNeedleAnimation';

export default function CognitiveLoadTachometer() {
  const { state } = useRaceSession();
  const needleRef = useRef<SVGGElement>(null);

  // Use the hook to animate the needle based on the current CL index
  useNeedleAnimation(state.currentCLIndex, needleRef);

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full pb-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-red/5 via-bg-card to-bg-card"></div>
      
      <div className="w-64 h-64 relative z-10">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="grad-green" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-subtle" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <path 
            d="M 30,170 A 100 100 0 1 1 170,170" 
            fill="none" 
            stroke="#111" 
            strokeWidth="12" 
            strokeLinecap="round" 
          />
          <path 
            d="M 30,170 A 100 100 0 1 1 170,170" 
            fill="none" 
            stroke="#222" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />

          {/* Active Arc (Green/Yellow) - Left Half */}
          <path 
            d="M 30,170 A 100 100 0 0 1 100,20" 
            fill="none" 
            stroke="url(#grad-green)" 
            strokeWidth="8" 
            strokeLinecap="round" 
            filter="url(#glow-subtle)"
          />
          
          {/* Active Arc (Yellow/Red) - Right Half */}
          <path 
            d="M 100,20 A 100 100 0 0 1 170,170" 
            fill="none" 
            stroke="url(#grad-red)" 
            strokeWidth="8" 
            strokeLinecap="round"
            filter="url(#glow-subtle)" 
          />

          {/* Micro Tick Marks */}
          {Array.from({ length: 41 }).map((_, i) => {
            const angle = -135 + (i * 6.75); // 40 segments
            const isMajor = i % 4 === 0;
            const rad = (angle - 90) * (Math.PI / 180);
            const r1 = isMajor ? 78 : 82;
            const x1 = 100 + r1 * Math.cos(rad);
            const y1 = 100 + r1 * Math.sin(rad);
            const x2 = 100 + 88 * Math.cos(rad);
            const y2 = 100 + 88 * Math.sin(rad);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isMajor ? "#666" : "#333"} strokeWidth={isMajor ? "2" : "1"} />
            );
          })}

          {/* Needle Group */}
          <g ref={needleRef} style={{ transformOrigin: "100px 100px" }}>
            <polygon points="98,100 102,100 100,30" fill="#ef4444" filter="url(#glow-subtle)" />
            {/* Glassmorphism Hub */}
            <circle cx="100" cy="100" r="12" fill="#111" stroke="#333" strokeWidth="2" />
            <circle cx="100" cy="100" r="4" fill="#ef4444" filter="url(#glow-strong)" />
          </g>
        </svg>

        {/* Digital Readout */}
        <div className="absolute bottom-4 left-0 right-0 text-center flex flex-col items-center">
          <span className="text-5xl font-bold font-mono tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-lg">
            {Math.round(state.currentCLIndex)}
          </span>
          <span className="text-[10px] text-accent-red uppercase tracking-widest mt-1 font-bold">
            CL Index
          </span>
        </div>
      </div>
    </div>
  );
}
