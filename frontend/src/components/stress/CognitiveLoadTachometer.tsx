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
      
      <div className="w-full h-full max-w-[500px] max-h-[500px] aspect-square relative z-10 flex items-center justify-center">
        
        {/* Digital Readout overlay (Top Center) */}
        <div className="absolute top-[25%] left-0 right-0 flex flex-col items-center justify-center pointer-events-none z-20">
          <span className="text-6xl font-mono font-bold tabular-nums text-[#FF9100] drop-shadow-[0_0_15px_rgba(255,145,0,0.8)] tracking-tighter">
            {Math.round(state.currentCLIndex)}
          </span>
        </div>

        <svg viewBox="0 0 200 200" className="w-[90%] h-[90%] drop-shadow-2xl">
          <defs>
            <filter id="glow-track" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-needle" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Segmented Track */}
          {/* Segment 1: Green */}
          <path d="M 43.43,156.57 A 80 80 0 0 1 23.4,100" fill="none" stroke="#00E676" strokeWidth="12" strokeLinecap="butt" filter="url(#glow-track)" />
          {/* Segment 2: Light Green */}
          <path d="M 23.4,96 A 80 80 0 0 1 60,30.7" fill="none" stroke="#AEEA00" strokeWidth="12" strokeLinecap="butt" filter="url(#glow-track)" />
          {/* Segment 3: Yellow */}
          <path d="M 63,28 A 80 80 0 0 1 137,28" fill="none" stroke="#FFEA00" strokeWidth="12" strokeLinecap="butt" filter="url(#glow-track)" />
          {/* Segment 4: Orange */}
          <path d="M 140,30.7 A 80 80 0 0 1 176.6,96" fill="none" stroke="#FF9100" strokeWidth="12" strokeLinecap="butt" filter="url(#glow-track)" />
          {/* Segment 5: Red */}
          <path d="M 176.6,100 A 80 80 0 0 1 156.57,156.57" fill="none" stroke="#FF003C" strokeWidth="12" strokeLinecap="butt" filter="url(#glow-track)" />

          {/* Inner Dial Base */}
          <path d="M 47,153 A 75 75 0 1 1 153,153" fill="none" stroke="#222" strokeWidth="1" />

          {/* Ticks and Numbers */}
          {Array.from({ length: 51 }).map((_, i) => {
            const angle = -135 + (i * 5.4); // 50 intervals to span 270 degrees
            const isMajor = i % 10 === 0;
            const isMinor = i % 5 === 0 && !isMajor;
            
            // Skip rendering ticks that aren't major or minor (for cleaner look)
            if (!isMajor && !isMinor && i % 2 !== 0) return null;

            const rad = (angle - 90) * (Math.PI / 180);
            
            const rOuter = 74;
            const rInner = isMajor ? 62 : isMinor ? 68 : 71;
            
            const x1 = 100 + rOuter * Math.cos(rad);
            const y1 = 100 + rOuter * Math.sin(rad);
            const x2 = 100 + rInner * Math.cos(rad);
            const y2 = 100 + rInner * Math.sin(rad);

            // Numbers for major ticks
            let numberNode = null;
            if (isMajor) {
              const val = (i / 50) * 100;
              const rText = 50;
              const textX = 100 + rText * Math.cos(rad);
              const textY = 100 + rText * Math.sin(rad) + 4; // slight vertical adjust
              numberNode = (
                <text x={textX} y={textY} fill="#fff" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  {val}
                </text>
              );
            }

            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={isMajor ? "1.5" : "0.75"} opacity={isMajor ? 1 : 0.6} />
                {numberNode}
              </g>
            );
          })}

          {/* Needle Group */}
          <g transform="translate(100, 100)">
            <g ref={needleRef}>
              {/* Red Needle */}
              <polygon points="-1.5,0 1.5,0 0,-70" fill="#FF003C" filter="url(#glow-needle)" />
              
              {/* Metallic Hub Pivot */}
              <circle cx="0" cy="0" r="10" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="6" fill="#1f2937" />
              <circle cx="0" cy="0" r="3" fill="#FF003C" filter="url(#glow-needle)" />
            </g>
          </g>

          {/* Bottom Text (CL INDEX) */}
          <text x="100" y="175" fill="#00F0FF" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="2">
            CL INDEX
          </text>
        </svg>

      </div>
    </div>
  );
}
