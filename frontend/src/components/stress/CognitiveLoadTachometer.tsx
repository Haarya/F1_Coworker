import { useRaceSession } from '../../context/RaceSessionContext';

export default function CognitiveLoadTachometer() {
  const { state } = useRaceSession();
  
  const leftStress = Math.round(state.currentCLIndex);
  const rightStress = Math.max(0, Math.round(state.currentCLIndex - 6)); // Peak stress mock

  // Calculate clip heights (0% stress = 100% height hidden, 100% stress = 0% hidden)
  const leftFillHeight = 100 - leftStress;
  const rightFillHeight = 100 - rightStress;

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full bg-[#050505] p-6 overflow-hidden">
      
      {/* Deep Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a0505_0%,_#050505_60%)] opacity-80 pointer-events-none"></div>

      {/* Top Header - F1 Telemetry */}
      <div className="absolute top-6 left-0 w-full flex flex-col items-center z-20">
         <span className="text-[#E60012]/40 tracking-widest text-[10px] font-bold">F1</span>
         <span className="text-[#E60012]/30 tracking-[0.3em] text-[8px] uppercase">Telemetry</span>
      </div>

      {/* Main Meter Area */}
      <div className="w-full h-full relative flex items-center justify-center max-w-[900px] mt-8">
        
        {/* LEFT SECTION */}
        <div className="absolute left-0 top-0 bottom-0 w-[45%] flex flex-col items-end pr-10 z-10">
          <div className="flex flex-col items-end w-full max-w-[280px]">
            <span className="text-white/50 tracking-widest text-[9px] uppercase font-bold mb-1">Driver Stress Level</span>
            <span className="text-white/30 font-mono text-[8px] mb-2">100</span>
            
            <div className="relative w-full h-[280px] flex items-center">
               {/* Big Number */}
               <div className="absolute left-[-20px] flex flex-col items-center">
                 <span className="text-white font-black text-7xl tracking-tighter drop-shadow-[0_0_15px_rgba(255,0,0,0.4)]">
                   {leftStress}
                 </span>
                 <span className="text-[7px] text-[#E60012]/60 uppercase tracking-widest mt-1">Cognitive</span>
               </div>
               
               {/* Left Dial SVG */}
               <div className="absolute right-0 w-[120px] h-[280px]">
                  <svg width="100%" height="100%" viewBox="0 0 120 280" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="leftBase" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1a0a0a" />
                        <stop offset="100%" stopColor="#2d1111" />
                      </linearGradient>
                      
                      <linearGradient id="leftFill" x1="0" y1="1" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8c1c1c" />
                        <stop offset="50%" stopColor="#e63946" />
                        <stop offset="100%" stopColor="#ffb3b3" />
                      </linearGradient>
                      
                      <clipPath id="leftBracketClip">
                        <polygon points="0,0 40,0 120,140 40,280 0,280 80,140" />
                      </clipPath>
                    </defs>

                    <polygon points="0,0 40,0 120,140 40,280 0,280 80,140" fill="url(#leftBase)" stroke="rgba(230,0,18,0.2)" strokeWidth="1"/>
                    <polygon points="35,5 115,140 35,275 5,275 80,140 5,5" fill="none" stroke="rgba(0,0,0,0.8)" strokeWidth="4" />

                    <g clipPath="url(#leftBracketClip)">
                       <rect x="0" y={`${leftFillHeight}%`} width="120" height="280" fill="url(#leftFill)" className="transition-all duration-700 ease-out" />
                       <rect x="0" y={`${leftFillHeight}%`} width="120" height="4" fill="#ffffff" opacity="0.8" className="transition-all duration-700 ease-out shadow-[0_0_10px_white]" />
                    </g>
                    
                    <polygon points="0,0 40,0 120,140 40,280 0,280 80,140" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                    <polyline points="0,0 40,0 120,140" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.5" />

                    <g fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace" textAnchor="end">
                       <text x="-5" y="75">75</text>
                       <line x1="10" y1="70" x2="25" y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                       
                       <text x="-5" y="143">50</text>
                       <line x1="40" y1="140" x2="60" y2="140" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                       
                       <text x="-5" y="213">25</text>
                       <line x1="10" y1="210" x2="25" y2="210" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    </g>
                  </svg>
               </div>
            </div>
            
            <span className="text-white/30 font-mono text-[8px] mt-2 mr-[10px]">0</span>
          </div>
        </div>

        {/* CENTER SECTION - F1 CAR */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="relative w-[320px] h-[400px] flex items-center justify-center">
            
            {/* Subtle red floor highlight under car */}
            <div className="absolute top-[50%] w-[200px] h-[80px] bg-[#E60012]/10 blur-[30px] rounded-full"></div>
            
            <img 
              src="/Images/F1_car/car for meter.png" 
              alt="F1 Car Telemetry" 
              className="w-[80%] h-auto object-contain filter contrast-125 brightness-110 saturate-125 z-10"
              style={{ mixBlendMode: 'normal' }} // Since it's a PNG it probably has a transparent background
            />
          </div>
        </div>


        {/* RIGHT SECTION */}
        <div className="absolute right-0 top-0 bottom-0 w-[45%] flex flex-col items-start pl-10 z-10">
          <div className="flex flex-col items-start w-full max-w-[280px]">
             <div className="flex items-center gap-2 mb-1">
               <div className="w-1.5 h-1.5 bg-[#E60012] rounded-full animate-pulse shadow-[0_0_8px_#E60012]"></div>
               <span className="text-[#E60012]/80 tracking-widest text-[9px] uppercase font-bold">Live Telemetry</span>
             </div>
            <span className="text-white/30 font-mono text-[8px] mb-2 ml-[120px]">100</span>
            
            <div className="relative w-full h-[280px] flex items-center">
               <div className="absolute left-0 w-[120px] h-[280px]">
                  <svg width="100%" height="100%" viewBox="0 0 120 280" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="rightBase" x1="1" y1="0" x2="0" y2="0">
                        <stop offset="0%" stopColor="#1a0a0a" />
                        <stop offset="100%" stopColor="#2d1111" />
                      </linearGradient>
                      
                      <linearGradient id="rightFill" x1="1" y1="1" x2="0" y2="0">
                         <stop offset="0%" stopColor="#8c1c1c" />
                         <stop offset="50%" stopColor="#e63946" />
                         <stop offset="100%" stopColor="#ffb3b3" />
                      </linearGradient>
                      
                      <clipPath id="rightBracketClip">
                        <polygon points="120,0 80,0 0,140 80,280 120,280 40,140" />
                      </clipPath>
                    </defs>

                    <polygon points="120,0 80,0 0,140 80,280 120,280 40,140" fill="url(#rightBase)" stroke="rgba(230,0,18,0.2)" strokeWidth="1"/>
                    <polygon points="85,5 5,140 85,275 115,275 40,140 115,5" fill="none" stroke="rgba(0,0,0,0.8)" strokeWidth="4" />

                    <g clipPath="url(#rightBracketClip)">
                       <rect x="0" y={`${rightFillHeight}%`} width="120" height="280" fill="url(#rightFill)" className="transition-all duration-700 ease-out" />
                       <rect x="0" y={`${rightFillHeight}%`} width="120" height="4" fill="#ffffff" opacity="0.8" className="transition-all duration-700 ease-out shadow-[0_0_10px_white]" />
                    </g>
                    
                    <polygon points="120,0 80,0 0,140 80,280 120,280 40,140" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                    <polyline points="120,0 80,0 0,140" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.5" />

                    <g fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace" textAnchor="start">
                       <text x="125" y="75">75</text>
                       <line x1="95" y1="70" x2="110" y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                       
                       <text x="125" y="143">50</text>
                       <line x1="60" y1="140" x2="80" y2="140" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                       
                       <text x="125" y="213">25</text>
                       <line x1="95" y1="210" x2="110" y2="210" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    </g>
                  </svg>
               </div>
               
               <div className="absolute right-[-20px] flex flex-col items-center">
                 <span className="text-white font-black text-7xl tracking-tighter drop-shadow-[0_0_15px_rgba(255,0,0,0.4)]">
                   {rightStress}
                 </span>
                 <span className="text-[7px] text-[#E60012]/60 uppercase tracking-widest mt-1">Physical</span>
               </div>
            </div>
            
            <span className="text-white/30 font-mono text-[8px] mt-2 ml-[120px]">0</span>
          </div>
        </div>

      </div>

      {/* Footer Info Row */}
      <div className="absolute bottom-6 w-[80%] flex justify-between items-center z-20">
         <div className="flex flex-col items-center">
           <span className="text-[7px] text-white/40 tracking-[0.2em] uppercase font-bold mb-1">Heart Rate</span>
           <span className="text-white font-bold text-lg">168 <span className="text-[9px] font-normal text-white/40">bpm</span></span>
         </div>
         <div className="flex flex-col items-center">
           <span className="text-[7px] text-white/40 tracking-[0.2em] uppercase font-bold mb-1">Composite</span>
           <span className="text-white font-bold text-lg">83%</span>
         </div>
         <div className="flex flex-col items-center">
           <span className="text-[7px] text-white/40 tracking-[0.2em] uppercase font-bold mb-1">State</span>
           <span className="text-white font-bold text-lg uppercase tracking-widest drop-shadow-[0_0_10px_white]">Critical Load</span>
         </div>
      </div>

    </div>
  );
}
