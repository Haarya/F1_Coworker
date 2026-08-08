import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useRaceSession } from '../context/RaceSessionContext';

gsap.registerPlugin(ScrollToPlugin);

export function useClipSync() {
  const { state, dispatch } = useRaceSession();

  useEffect(() => {
    if (!state.activeEventId) return;

    const event = state.radioEvents.find(e => e.id === state.activeEventId);
    if (!event) return;

    const master = gsap.timeline();

    // 1. Highlight card
    const cardElement = document.getElementById(`event-${event.id}`);
    if (cardElement) {
      master.to(cardElement, {
        borderColor: "#E31D2B",
        boxShadow: "0 0 15px rgba(225, 6, 0, 0.3)",
        duration: 0.3,
        yoyo: true,
        repeat: 3 // Pulse effect
      }, 0);
    }

    // 2. Scroll transcript
    const transcriptLine = document.getElementById(`transcript-${event.id}`);
    const transcriptContainer = document.getElementById('live-transcript-container');
    
    if (transcriptLine && transcriptContainer) {
      master.to(transcriptContainer, {
        scrollTo: { y: transcriptLine, offsetY: 20 },
        duration: 0.5,
        ease: "power2.out"
      }, 0.2);
    }

    // 3. Move driver dot on track map
    const trackDot = document.getElementById('driver-dot');
    if (trackDot) {
      master.to(trackDot, {
        duration: 0.5,
        ease: "power2.inOut",
        scale: 1.5,
        yoyo: true,
        repeat: 1
      }, 0);
    }

    return () => {
      master.kill();
      if (cardElement) {
        gsap.set(cardElement, { borderColor: "transparent", boxShadow: "none" });
      }
    };
  }, [state.activeEventId, state.radioEvents, dispatch]);
}
