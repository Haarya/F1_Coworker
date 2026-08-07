import React, { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion, useMotionValue, useMotionValueEvent, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const TOTAL_FRAMES = 96;
const ASSETS_PATH = '/FerrariFinal/';
const EXTENSION = '.png';

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [mode, setMode] = useState<'loading' | 'autoplay' | 'interactive'>('loading');

  // Master progress value controlling the animation
  const activeProgress = useMotionValue(0);
  const { scrollYProgress } = useScroll();
  
  // Map master progress to frame index
  const frameIndex = useTransform(activeProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  useEffect(() => {
    // Preload images
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      // Format 0 -> 'FerrariFinal_000.png'
      const paddedIndex = String(i).padStart(3, '0');
      img.src = `${ASSETS_PATH}FerrariFinal_${paddedIndex}${EXTENSION}`;
      
      img.onload = () => {
        loadedCount++;
        loadedImages[i] = img;
        setLoadingProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        
        if (loadedCount === TOTAL_FRAMES) {
          setImages(loadedImages);
          setTimeout(() => setMode('autoplay'), 1500); // 1.5s artificial delay to see loading state
        }
      };
      
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setImages(loadedImages);
          setTimeout(() => setMode('autoplay'), 1500);
        }
      }
    }
  }, []);

  // Autoplay sequence on load
  useEffect(() => {
    if (mode === 'autoplay') {
      // Lock scrolling and ensure we're at the top during autoplay
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);

      const controls = animate(activeProgress, 1, {
        duration: 5.5, // ~17.5fps playback for smooth cinematic slowdown
        ease: "linear",
        onComplete: () => {
          // Unlock scrolling
          document.body.style.overflow = '';
          // Jump to the bottom so native scroll matches activeProgress = 1
          window.scrollTo(0, document.documentElement.scrollHeight);
          setMode('interactive');
        }
      });

      return () => {
        controls.stop();
        document.body.style.overflow = '';
      };
    }
  }, [mode, activeProgress]);

  // Sync scroll to progress when interactive
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (mode === 'interactive') {
      activeProgress.set(latest);
    }
  });

  // Canvas drawing logic
  useEffect(() => {
    if (mode === 'loading' || images.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let animationFrameId: number;
    let currentFrame = -1;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        currentFrame = -1; // force redraw
      }

      const targetFrame = Math.min(
        TOTAL_FRAMES - 1, 
        Math.max(0, Math.round(frameIndex.get()))
      );

      if (currentFrame !== targetFrame && images[targetFrame]) {
        const img = images[targetFrame];
        ctx.clearRect(0, 0, rect.width, rect.height);
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        const imgRatio = img.width / img.height;
        const canvasRatio = rect.width / rect.height;
        
        const ZOOM = 1.15;
        let drawWidth = 0;
        let drawHeight = 0;
        let drawX = 0;
        let drawY = 0;

        if (imgRatio > canvasRatio) {
          drawHeight = rect.height * ZOOM;
          drawWidth = (rect.height * imgRatio) * ZOOM;
        } else {
          drawWidth = rect.width * ZOOM;
          drawHeight = (rect.width / imgRatio) * ZOOM;
        }
        
        drawX = (rect.width - drawWidth) / 2;
        drawY = (rect.height - drawHeight) / 2;

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        currentFrame = targetFrame;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, images, frameIndex]);

  // Text Animations mapped to activeProgress
  const blackScreenOpacity = useTransform(activeProgress, [0, 0.15], [1, 0]);

  const opacity2 = useTransform(activeProgress, [0.25, 0.3, 0.45, 0.5], [0, 1, 1, 0]);
  const y2 = useTransform(activeProgress, [0.25, 0.3, 0.45, 0.5], [20, 0, 0, -20]);

  const opacity3 = useTransform(activeProgress, [0.55, 0.6, 0.75, 0.8], [0, 1, 1, 0]);
  const y3 = useTransform(activeProgress, [0.55, 0.6, 0.75, 0.8], [20, 0, 0, -20]);

  const opacity4 = useTransform(activeProgress, [0.85, 0.9, 1, 1], [0, 1, 1, 1]);
  const y4 = useTransform(activeProgress, [0.85, 0.9, 1, 1], [20, 0, 0, 0]);

  return (
    <div className="relative h-[500vh] w-full bg-[#080808] font-sans selection:bg-[#E31D2B] selection:text-white">
      {/* Loading State */}
      {mode === 'loading' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080808] text-white">
          <div className="w-64 h-1 bg-white/10 rounded overflow-hidden mb-6">
            <div 
              className="h-full bg-[#E31D2B] transition-all duration-200" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-sm tracking-[0.2em] text-white/60 uppercase">
            CALIBRATING TELEMETRY... {loadingProgress}%
          </p>
        </div>
      )}

      {/* Sticky Canvas Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Initial Black Screen Fade */}
        <motion.div 
          style={{ opacity: blackScreenOpacity }}
          className="absolute inset-0 bg-[#080808] pointer-events-none z-10"
        />

        {/* Text Overlay 2 */}
        <motion.div 
          style={{ opacity: opacity2, y: y2 }}
          className="absolute inset-x-0 bottom-1/4 px-10 md:px-24 flex flex-col items-start text-left pointer-events-none"
        >
          <div className="border-l-4 border-[#E31D2B] pl-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white/95 mb-4 uppercase drop-shadow-lg">
              INSTANT ACCELERATION.
            </h2>
            <p className="text-lg md:text-xl text-white/60 font-medium tracking-wide max-w-md drop-shadow-md">
              0 to 200 km/h in 4.4 seconds.
            </p>
          </div>
        </motion.div>

        {/* Text Overlay 3 */}
        <motion.div 
          style={{ opacity: opacity3, y: y3 }}
          className="absolute inset-x-0 top-1/4 px-10 md:px-24 flex flex-col items-end text-right pointer-events-none"
        >
          <div className="border-r-4 border-[#E31D2B] pr-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white/95 mb-4 uppercase drop-shadow-lg">
              AERODYNAMIC PERFECT.
            </h2>
            <p className="text-lg md:text-xl text-white/60 font-medium tracking-wide max-w-md drop-shadow-md">
              Downforce engineered for maximum cornering speed.
            </p>
          </div>
        </motion.div>

        {/* Text Overlay 4 with CTA */}
        <motion.div 
          style={{ opacity: opacity4, y: y4 }}
          className="absolute inset-x-0 bottom-16 flex flex-col items-center justify-center text-center p-6 z-40"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white/95 mb-2 uppercase drop-shadow-lg">
            COCKPIT FOCUS.
          </h2>
          <p className="text-md text-white/60 font-medium tracking-wide mb-8 drop-shadow-md">
            Scroll back to replay the launch.
          </p>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-3 bg-[#E31D2B] hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(227,29,43,0.4)] hover:shadow-[0_0_30px_rgba(227,29,43,0.6)]"
          >
            Enter Command Center
            <Activity size={22} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

