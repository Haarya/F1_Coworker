import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import { FastForward } from 'lucide-react';

// Configuration for the image sequence
const TOTAL_FRAMES = 90; // Using the new f1ow sequence
const ASSETS_PATH = '/f1ow/';
const PREFIX = 'Use_the_uploaded_video_as_the (online-video-cutter.com)_';
const EXTENSION = '.jpg';
const PLAYBACK_SPEED = 4.0; // seconds for one loop

const infoTexts = [
  {
    title: "THE SILENT CO-DRIVER",
    desc: "A cognitive load and biometric stress analyzer."
  },
  {
    title: "COGNITIVE LOAD INDEX",
    desc: "Measuring vocal stress and mapping it to a 0-100 scale in real-time."
  },
  {
    title: "G-FORCE SEPARATOR",
    desc: "Isolating pure psychological frustration from high-G physical strain."
  },
  {
    title: "ACTIVE INTERCEPT",
    desc: "Predicting lap penalties and simulating pit wall radio lockouts."
  }
];

export default function IntroVideoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [mode, setMode] = useState<'loading' | 'playing'>('loading');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const navigate = useNavigate();

  const activeProgress = useMotionValue(0);

  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, '0');
      img.src = `${ASSETS_PATH}${PREFIX}${paddedIndex}${EXTENSION}`;
      
      img.onload = () => {
        loadedCount++;
        loadedImages[i] = img;
        setLoadingProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        
        if (loadedCount === TOTAL_FRAMES) {
          setImages(loadedImages);
          setTimeout(() => setMode('playing'), 500);
        }
      };
      
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setImages(loadedImages);
          setTimeout(() => setMode('playing'), 500);
        }
      };
    }
  }, []);

  // Autoplay sequence looping forever
  useEffect(() => {
    if (mode === 'playing') {
      const controls = animate(activeProgress, TOTAL_FRAMES - 1, {
        duration: PLAYBACK_SPEED,
        ease: "linear",
        repeat: Infinity,
      });

      return () => controls.stop();
    }
  }, [mode, activeProgress]);

  // Cycle through texts
  useEffect(() => {
    if (mode === 'playing') {
      const interval = setInterval(() => {
        setCurrentTextIndex((prev) => (prev + 1) % infoTexts.length);
      }, 4000); // Change text every 4 seconds
      return () => clearInterval(interval);
    }
  }, [mode]);

  // Canvas drawing
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
        currentFrame = -1;
      }

      const targetFrame = Math.min(
        TOTAL_FRAMES - 1, 
        Math.max(0, Math.round(activeProgress.get()))
      );

      if (currentFrame !== targetFrame && images[targetFrame]) {
        const img = images[targetFrame];
        ctx.clearRect(0, 0, rect.width, rect.height);
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        const imgRatio = img.width / img.height;
        const canvasRatio = rect.width / rect.height;
        
        let drawWidth, drawHeight;
        if (imgRatio > canvasRatio) {
          drawHeight = rect.height;
          drawWidth = rect.height * imgRatio;
        } else {
          drawWidth = rect.width;
          drawHeight = rect.width / imgRatio;
        }
        
        const drawX = (rect.width - drawWidth) / 2;
        const drawY = (rect.height - drawHeight) / 2;

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        currentFrame = targetFrame;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, images, activeProgress]);

  return (
    <div className="relative h-screen w-full bg-[#080808] overflow-hidden font-sans selection:bg-[#E31D2B] selection:text-white">
      {/* Loading State */}
      <AnimatePresence>
        {mode === 'loading' && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#080808] text-white"
          >
            <div className="w-64 h-1 bg-white/10 rounded overflow-hidden mb-6">
              <div 
                className="h-full bg-[#E31D2B] transition-all duration-200" 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-sm tracking-[0.2em] text-white/60 uppercase">
              INITIALIZING VIDEO FEED... {loadingProgress}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

      {/* Animated Text Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTextIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white/95 mb-4 uppercase drop-shadow-[0_0_15px_rgba(227,29,43,0.5)] font-f1 border-b-2 border-[#E31D2B] pb-4 inline-block">
              {infoTexts[currentTextIndex].title}
            </h2>
            <p className="text-xl md:text-2xl text-white/80 font-medium tracking-wide drop-shadow-md">
              {infoTexts[currentTextIndex].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Top Right Dashboard Button */}
      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={() => navigate('/dashboard')}
          className="group relative inline-flex items-center gap-3 bg-black/40 backdrop-blur-md border border-[#E31D2B]/50 hover:border-[#E31D2B] hover:bg-[#E31D2B]/20 text-white font-bold py-3 px-6 rounded text-sm tracking-[0.15em] transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-2">
            ACCESS PIT WALL <FastForward size={16} className="group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 border-b-2 border-[#E31D2B] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
        </button>
      </div>

    </div>
  );
}
