import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

export default function IMOAssistantCard() {
  const dummyChat = [
    { text: "I've detected elevated cognitive load in Sector 3. Driver is struggling with turn-in stability." },
    { text: "Recommend suggesting a shift in brake bias forward by 2% to stabilize the rear under heavy braking in Turn 11." },
    { text: "Telemetry indicates early lifting in Turn 4. High probability of rear tire degradation." }
  ];

  return (
    <div className="gsap-bento flex-[1.3] min-h-0 bg-[#0d0d0d] rounded-2xl overflow-hidden border border-[var(--theme-30)] relative shadow-[0_0_15px_var(--theme-10)] hover:shadow-[0_0_25px_var(--theme-30)] transition-all duration-300 flex flex-col pointer-events-auto">
      
      {/* Header */}
      <h2 className="absolute top-5 left-5 z-20 text-[13px] font-f1 font-black uppercase tracking-[0.35em] text-[var(--theme-70)] flex items-center gap-2 drop-shadow-[0_0_8px_var(--theme-50)] whitespace-nowrap">
         <Sparkles className="w-3.5 h-3.5 text-[var(--theme-base)] animate-pulse" /> EMO AI Helper
      </h2>
      
      {/* Content Window */}
      <div className="pt-16 w-full h-full p-2 pb-4">
        <div className="bg-[#141414] border border-[#333] rounded-xl w-full h-full flex flex-col pointer-events-auto p-4 gap-3 overflow-y-auto scrollbar-thick pr-2">
          {dummyChat.map((msg, idx) => (
            <div key={idx} className="group p-3 rounded-lg border border-white/5 bg-white/5 text-white/60 shadow-sm transition-all duration-300 hover:border-[var(--theme-40)] hover:bg-[var(--theme-10)] hover:text-white hover:shadow-[0_0_10px_var(--theme-20)] cursor-default">
              <div className="text-[9px] font-black tracking-widest uppercase mb-1.5 flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                <Bot className="w-3 h-3 text-white/40 group-hover:text-[var(--theme-base)] transition-colors duration-300" />
                <span className="text-white/40 group-hover:text-[var(--theme-base)] transition-colors duration-300">EMO</span>
              </div>
              <p className="leading-relaxed text-[11px]">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
