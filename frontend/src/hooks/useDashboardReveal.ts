import { useLayoutEffect } from 'react';
import gsap from 'gsap';

export function useDashboardReveal() {
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      tl.from(".topbar", { y: -60, opacity: 0, duration: 0.6 })
        .from(".grid-card", { 
          y: 40, opacity: 0, scale: 0.95, 
          stagger: 0.1, duration: 0.5 
        }, "-=0.3")
        .from(".summary-bar", { y: 30, opacity: 0, duration: 0.4 }, "-=0.2");
    });
    
    return () => {
      ctx.revert();
    };
  }, []);
}
