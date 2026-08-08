import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { curveCatmullRomClosed } from '@visx/curve';
import { ParentSize } from '@visx/responsive';
import { useRaceSession } from '../../context/RaceSessionContext';

export default function DynamicStressTrackMap() {
  const { state } = useRaceSession();
  const circuit = state.circuitPath;
  const stressMap = state.stressMap;

  // Calculate current car position based on playback percentage
  const lapDuration = 100;
  const progress = (state.playbackTimestamp % lapDuration) / lapDuration;
  const currentIndex = Math.floor(progress * circuit.length);
  const currentPos = circuit[Math.min(currentIndex, circuit.length - 1)];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-bg-dark to-bg-dark opacity-50"></div>
      <div className="flex-1 w-full relative z-10">
        {circuit.length > 0 && (
          <ParentSize>
            {({ width, height }) => {
              if (width < 10 || height < 10) return null;
              
              const margin = { top: 20, right: 20, bottom: 20, left: 20 };
              const xMax = width - margin.left - margin.right;
              const yMax = height - margin.top - margin.bottom;

              const minX = Math.min(...circuit.map(d => d.x));
              const maxX = Math.max(...circuit.map(d => d.x));
              const minY = Math.min(...circuit.map(d => d.y));
              const maxY = Math.max(...circuit.map(d => d.y));

              const xScale = scaleLinear<number>({ range: [0, xMax], domain: [minX, maxX] });
              const yScale = scaleLinear<number>({ range: [yMax, 0], domain: [minY, maxY] });

              return (
                <svg width={width} height={height}>
                  <defs>
                    <filter id="track-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  
                  <g transform={`translate(${margin.left},${margin.top})`}>
                    {/* Base circuit path */}
                    <LinePath
                      data={circuit}
                      x={d => xScale(d.x) ?? 0}
                      y={d => yScale(d.y) ?? 0}
                      curve={curveCatmullRomClosed}
                      stroke="#1f2937"
                      strokeWidth={8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Overlay stress colors */}
                    {stressMap.map((d, i) => {
                      if (i === 0) return null;
                      const prev = stressMap[i - 1];
                      const color = d.stressLevel > 70 ? '#FF003C' : d.stressLevel > 40 ? '#FFEA00' : '#00E676';
                      
                      return (
                        <line
                          key={i}
                          x1={xScale(prev.x)}
                          y1={yScale(prev.y)}
                          x2={xScale(d.x)}
                          y2={yScale(d.y)}
                          stroke={color}
                          strokeWidth={3}
                          strokeLinecap="round"
                          filter="url(#track-glow)"
                        />
                      );
                    })}

                    {/* Car Position Marker */}
                    {currentPos && (
                      <g transform={`translate(${xScale(currentPos.x)}, ${yScale(currentPos.y)})`}>
                        <circle r={6} fill="#ef4444" filter="url(#track-glow)" />
                        <circle r={2} fill="#ffffff" />
                      </g>
                    )}
                  </g>
                </svg>
              );
            }}
          </ParentSize>
        )}
      </div>
    </div>
  );
}
