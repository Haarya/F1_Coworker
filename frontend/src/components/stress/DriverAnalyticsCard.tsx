import React from 'react';
import { Heart, Cloud, Brain, Lock } from 'lucide-react';
import { useRaceSession } from '../../context/RaceSessionContext';

export default function DriverAnalyticsCard() {
  const { state } = useRaceSession();

  // We'll map the current CL index to some pseudo-analytics for demonstration
  // In a real scenario, this would come from the context/backend
  const score = state.currentCLIndex || 80.4;
  
  let emotion = "Angry";
  let category = "CRITICAL";
  
  if (score < 40) {
    emotion = "Focused";
    category = "OPTIMAL";
  } else if (score < 75) {
    emotion = "Tense";
    category = "ELEVATED";
  }

  return (
    <div className="flex-1 bg-[#0d0d0d] rounded-2xl overflow-hidden border border-[#E60012]/30 relative shadow-[0_0_15px_rgba(230,0,18,0.15)] hover:shadow-[0_0_25px_rgba(230,0,18,0.3)] transition-all duration-300 flex flex-col p-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10 relative">
         <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#E60012] drop-shadow-[0_0_8px_rgba(230,0,18,0.5)]">
            Driver Analytics
         </h2>
         <div className="bg-black/50 border border-white/10 px-2 py-1 rounded flex items-center gap-1.5 backdrop-blur-sm shrink-0">
            <span className="text-[9px] uppercase tracking-wider text-white/80 font-semibold">Locked In</span>
            <Lock className="w-2.5 h-2.5 text-white/80" />
            <span className="text-[9px] text-white/50 ml-1 font-mono">• 11s</span>
         </div>
      </div>

      {/* Analytics Rows */}
      <div className="flex-1 flex flex-col justify-center gap-4 z-10 relative px-1">
         
         {/* Row 1 */}
         <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-[#E60012] fill-[#E60012]" strokeWidth={1.5} />
            <div className="text-[11px] tracking-wide whitespace-nowrap">
               <span className="text-white/80 font-light">Primary Emotion: </span>
               <span className="text-[#E60012] font-semibold">{emotion}</span>
            </div>
         </div>
         
         {/* Row 2 */}
         <div className="flex items-center gap-3">
            <Cloud className="w-4 h-4 text-[#E60012] fill-[#E60012]/20" strokeWidth={1.5} />
            <div className="text-[11px] tracking-wide whitespace-nowrap">
               <span className="text-white/80 font-light">Cognitive Load Score: </span>
               <span className="text-[#E60012] font-semibold">{score.toFixed(1)}</span>
            </div>
         </div>
         
         {/* Row 3 */}
         <div className="flex items-center gap-3">
            <Brain className="w-4 h-4 text-[#E60012] fill-[#E60012]/20" strokeWidth={1.5} />
            <div className="text-[11px] tracking-wide whitespace-nowrap">
               <span className="text-white/80 font-light">Stress Level Category: </span>
               <span className="text-[#E60012] font-semibold">{category}</span>
            </div>
         </div>

      </div>
      
    </div>
  );
}
