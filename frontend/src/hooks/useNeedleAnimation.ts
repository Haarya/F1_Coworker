import { useLayoutEffect } from 'react';
import gsap from 'gsap';

export function useNeedleAnimation(
  clIndex: number, 
  needleRef: React.RefObject<SVGGElement | null>
) {
  useLayoutEffect(() => {
    if (!needleRef.current) return;
    
    // Map clIndex (0-100) to rotation (-135deg to +135deg)
    // 0 -> -135
    // 50 -> 0
    // 100 -> +135
    const rotation = -135 + (clIndex / 100) * 270;

    let ctx = gsap.context(() => {
      gsap.to(needleRef.current, {
        rotation,
        duration: 1.5,
        ease: "elastic.out(1, 0.4)",
        transformOrigin: "50% 100%"
      });
    }, needleRef);

    return () => {
      ctx.revert();
    };
  }, [clIndex, needleRef]);
}
