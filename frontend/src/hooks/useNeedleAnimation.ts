import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export function useNeedleAnimation(
  clIndex: number, 
  needleRef: React.RefObject<SVGGElement | null>
) {
  const rotationTo = useRef<gsap.QuickToFunc | null>(null);

  useLayoutEffect(() => {
    if (!needleRef.current) return;
    
    // Force initial rotation based on the starting clIndex
    const initialRotation = -135 + (clIndex / 100) * 270;
    gsap.set(needleRef.current, { 
      rotation: initialRotation,
      transformOrigin: "50% 100%"
    });
    
    // Create a highly optimized quickTo function on mount
    rotationTo.current = gsap.quickTo(needleRef.current, "rotation", {
      duration: 0.3,
      ease: "power2.out",
      transformOrigin: "50% 100%"
    });

    return () => {
      // Clean up if needed, though quickTo doesn't strictly need a revert like context
    };
  }, [needleRef]);

  useLayoutEffect(() => {
    if (rotationTo.current) {
      // Map clIndex (0-100) to rotation (-135deg to +135deg)
      const rotation = -135 + (clIndex / 100) * 270;
      rotationTo.current(rotation);
    }
  }, [clIndex]);
}
