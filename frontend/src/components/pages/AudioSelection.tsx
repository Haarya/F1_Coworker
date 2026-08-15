import { useNavigate } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import { useRaceSession } from '../../context/RaceSessionContext';

const AUDIO_FILES = [
  "Audio File 1",
  "Audio File 2",
  "Audio File 3",
  "Audio File 4",
  "Audio File 5",
  "Audio File 6",
];

export default function AudioSelection() {
  const { dispatch } = useRaceSession();
  const navigate = useNavigate();

  const handleSelectAudio = (filename: string) => {
    dispatch({ 
      type: 'SET_SELECTED_AUDIO', 
      payload: filename
    });
    navigate('/dashboard');
  };

  return (
    <div className="flex-1 h-full w-full bg-[#050505] overflow-hidden flex font-sans">
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
           <div>
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">Select Audio</h1>
             <p className="text-white/40 text-xs tracking-widest uppercase mt-2">Driver team radio configuration</p>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-20">
          {AUDIO_FILES.map((filename, index) => {
            return (
              <div 
                key={index}
                onClick={() => handleSelectAudio(filename)}
                className="group relative rounded-xl border-2 border-[#333] bg-[#0d0d0d] overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#E60012] hover:shadow-[0_0_15px_#E60012,0_0_40px_#E6001288,inset_0_0_15px_#E6001244] z-10 hover:z-50 aspect-video flex flex-col items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#E60012]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Audio Icon Placeholder */}
                <div className="w-12 h-12 mb-3 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300 group-hover:border-[#E60012]/50">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-white/40 group-hover:text-white transition-colors duration-300">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                
                <span className="relative z-20 text-white/60 font-mono text-sm tracking-widest uppercase group-hover:text-white transition-colors duration-300">
                  {filename}
                </span>
                
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20 rounded-tl m-2 z-20 pointer-events-none group-hover:border-[#E60012]/50"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 rounded-tr m-2 z-20 pointer-events-none group-hover:border-[#E60012]/50"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20 rounded-bl m-2 z-20 pointer-events-none group-hover:border-[#E60012]/50"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20 rounded-br m-2 z-20 pointer-events-none group-hover:border-[#E60012]/50"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
