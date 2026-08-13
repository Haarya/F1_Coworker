import React, { createContext, useContext, useRef, useState, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface TransitionContextType {
  playTransition: (onCover: () => void) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

const getStreakColor = () => {
  const rand = Math.random();
  if (rand < 0.7) return '#18181b'; // Deep Carbon
  if (rand < 0.9) return '#E10600'; // F1 Red
  return '#f4f4f5'; // Silver/White
};

const generateRhombus = (type: 'matrix' | 'micro') => {
  const isMicro = type === 'micro';
  // Varied lengths: Matrix strips randomly stop abruptly, Micro lines often span fully
  const lengthPercent = isMicro ? (Math.random() > 0.4 ? 100 : Math.random() * 50 + 20) : (Math.random() * 60 + 20);
  const widthVmax = lengthPercent * 2; // Container is 200vmax wide
  const leftOffset = Math.random() * (200 - widthVmax); // Random absolute horizontal offset

  return {
    color: getStreakColor(),
    top: `${Math.random() * 100}%`,
    left: `${leftOffset}vmax`,
    width: `${widthVmax}vmax`,
    height: isMicro ? `${Math.random() * 0.15 + 0.05}vmax` : `${Math.random() * 3 + 0.8}vmax`,
    // Perfect parallelogram cuts: Offset matches approximate height for 45-degree angles
    clipPath: isMicro ? 'none' : 'polygon(2vmax 0, 100% 0, calc(100% - 2vmax) 100%, 0 100%)',
    shadow: isMicro ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]',
  };
};

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const l1Refs = useRef<(HTMLDivElement | null)[]>([]);
  const l2Refs = useRef<(HTMLDivElement | null)[]>([]);
  const l3Refs = useRef<(HTMLDivElement | null)[]>([]);

  // Layer 1: The Foundation - 25 thick vertical strips stacking to guarantee 100% coverage
  const l1Config = useMemo(() => Array.from({ length: 25 }).map(() => ({ color: getStreakColor() })), []);
  
  // Layer 2: The Matrix - 50 Dynamic Midground Parallelograms (abrupt ends)
  const l2Config = useMemo(() => Array.from({ length: 50 }).map(() => generateRhombus('matrix')), []);
  
  // Layer 3: The Micro-Details - 30 Foreground Racing Stripes (high contrast)
  const l3Config = useMemo(() => Array.from({ length: 30 }).map(() => generateRhombus('micro')), []);

  const { contextSafe } = useGSAP({ scope: containerRef });

  const playTransition = useCallback(
    contextSafe((onCover: () => void) => {
      setIsTransitioning(true);

      const tl = gsap.timeline({
        onComplete: () => {
          setIsTransitioning(false);
        }
      });

      // Initial off-screen positions (parallax start points Top-Left)
      gsap.set(l1Refs.current, { x: "-200vmax" });
      gsap.set(l2Refs.current, { x: "-250vmax" });
      gsap.set(l3Refs.current, { x: "-300vmax" });

      tl.addLabel("in", 0);
      
      // Phase 1: The Sweep In (Top-Left -> Center)
      // Wave cascade in, slamming the brakes at the apex (expo.out)
      tl.to(l1Refs.current, { x: 0, stagger: { amount: 0.8, from: "start" }, duration: 1.0, ease: 'expo.out' }, "in");
      tl.to(l2Refs.current, { x: 0, stagger: { amount: 0.8, from: "start" }, duration: 1.2, ease: 'expo.out' }, "in");
      tl.to(l3Refs.current, { x: 0, stagger: { amount: 0.8, from: "start" }, duration: 1.4, ease: 'expo.out' }, "in");

      // Phase 2: The Freeze-Frame Hold (Peak density occurs at 1.4s + 0.8s stagger = 2.2s)
      const peakTime = 2.2; 
      
      // Execute the DOM swap precisely during the hold
      tl.call(onCover, undefined, peakTime + 0.1);

      // Add a 200ms visual hold before peeling away
      const outTime = peakTime + 0.2;
      tl.addLabel("out", outTime);
      
      // Phase 3: The Sweep Out (Center -> Bottom-Right)
      // Accelerate smoothly out of the apex off to the bottom right (expo.in)
      tl.to(l1Refs.current, { x: "200vmax", stagger: { amount: 0.5, from: "start" }, duration: 0.8, ease: 'expo.in' }, "out");
      tl.to(l2Refs.current, { x: "250vmax", stagger: { amount: 0.5, from: "start" }, duration: 1.0, ease: 'expo.in' }, "out");
      tl.to(l3Refs.current, { x: "300vmax", stagger: { amount: 0.5, from: "start" }, duration: 1.2, ease: 'expo.in' }, "out");
    }),
    []
  );

  return (
    <TransitionContext.Provider value={{ playTransition, isTransitioning }}>
      {children}
      
      <div 
        ref={containerRef}
        className={`fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden ${isTransitioning ? 'visible' : 'hidden'}`}
      >
        <div className="w-[200vmax] h-[200vmax] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45">
          
          {/* Layer 1 (The Foundation: 20% of structural weight) */}
          <div className="absolute inset-0 flex flex-col z-10">
            {l1Config.map((c, i) => (
              <div
                key={`l1-${i}`}
                ref={(el) => { l1Refs.current[i] = el; }}
                className="flex-1 w-full scale-y-[1.05]"
                style={{ backgroundColor: c.color, transform: 'translateX(-200vmax)' }}
              />
            ))}
          </div>

          {/* Layer 2 (The Matrix: 50% dynamic interlocking strips) */}
          <div className="absolute inset-0 z-20">
            {l2Config.map((c, i) => (
              <div
                key={`l2-${i}`}
                ref={(el) => { l2Refs.current[i] = el; }}
                className={`absolute ${c.shadow}`}
                style={{ 
                  top: c.top, left: c.left, width: c.width, height: c.height, 
                  backgroundColor: c.color, clipPath: c.clipPath,
                  transform: 'translateX(-250vmax)' 
                }}
              />
            ))}
          </div>

          {/* Layer 3 (The Micro-Details: 30% hyper-fast thin lines) */}
          <div className="absolute inset-0 z-50">
            {l3Config.map((c, i) => (
              <div
                key={`l3-${i}`}
                ref={(el) => { l3Refs.current[i] = el; }}
                className={`absolute ${c.shadow}`}
                style={{ 
                  top: c.top, left: c.left, width: c.width, height: c.height, 
                  backgroundColor: c.color, clipPath: c.clipPath,
                  transform: 'translateX(-300vmax)' 
                }}
              />
            ))}
          </div>

        </div>
      </div>
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);
  if (context === undefined) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
}
