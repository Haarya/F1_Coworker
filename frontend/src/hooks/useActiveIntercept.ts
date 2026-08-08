import { useEffect } from 'react';
import gsap from 'gsap';

export function useActiveIntercept(interceptActive: boolean) {
  useEffect(() => {
    if (!interceptActive) return;
    
    const overlay = document.querySelector('.intercept-overlay');
    if (!overlay) return;

    const tl = gsap.timeline();
    
    // Red flash border
    tl.fromTo(overlay, 
      { opacity: 0, scale: 1.05 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "power4.out" }
    )
    // Pulsing glow
    .to(overlay, {
      boxShadow: "inset 0 0 60px rgba(225, 6, 0, 0.6)",
      repeat: 3,
      yoyo: true,
      duration: 0.5
    });
    
    return () => {
      tl.kill();
      gsap.set(overlay, { opacity: 0 }); // Clean up
    };
  }, [interceptActive]);
}
