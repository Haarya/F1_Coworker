import React, { useRef } from 'react';
import { UploadCloud, CloudUpload } from 'lucide-react';

export default function UploadAudioCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name);
      // Mock upload logic can be added here
    }
  };

  return (
    <div className="w-full h-full bg-[#0d0d0d] rounded-2xl overflow-hidden border border-[#E60012]/30 relative shadow-[0_0_15px_rgba(230,0,18,0.15)] hover:shadow-[0_0_25px_rgba(230,0,18,0.3)] transition-all duration-300 flex flex-col">
      
      {/* Header */}
      <h2 className="absolute top-4 left-5 z-10 text-[10px] font-bold uppercase tracking-widest text-[#E60012]/70 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(230,0,18,0.5)]">
        <UploadCloud className="w-3.5 h-3.5 text-[#E60012]" />
        Upload Audio File
      </h2>

      {/* Main Upload Area */}
      <div className="flex-1 pt-12 pb-4 px-4 w-full h-full flex items-center justify-center">
        <div 
          onClick={handleClick}
          className="w-full h-full rounded-xl border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#E60012]/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative"
        >
          <CloudUpload className="w-8 h-8 text-white/50 mb-3 group-hover:text-[#E60012] group-hover:scale-110 transition-all duration-300" strokeWidth={1.5} />
          
          <div className="text-center px-4">
             <span className="text-white/60 text-[11px] font-medium tracking-wide">
                Drag & drop audio file here<br/>
                or click to browse
             </span>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="audio/*" 
            className="hidden" 
          />
        </div>
      </div>
      
    </div>
  );
}
