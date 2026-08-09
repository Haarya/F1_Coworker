import { useNavigate } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import { useRaceSession } from '../../context/RaceSessionContext';

const RAW_DRIVER_FILES = [
  "Alexander_Albon_0057B8.png",
  "Arvid_Lindblad_1645D8.png",
  "Carlos_Sainz_0057B8.png",
  "Charles_Leclerc_E60012.png",
  "Esteban_Ocon_6F777B.png",
  "Fernando_Alonso_007A5E.png",
  "Franco_Colapinto_0096D6.png",
  "Gabriel_Bortoleto_F52B18.png",
  "George_Russell_12D8C4.png",
  "Isack_Hadjar_2463B5.png",
  "Kimi_Antonelli_12D8C4.png",
  "Lance_Stroll_007A5E.png",
  "Lando_Norris_FF8000.png",
  "Lewis_Hamilton_E60012.png",
  "Liam_Lawson_1645D8.png",
  "Max_Verstappen_2463B5.png",
  "Nico_Hulkenberg_F52B18.png",
  "Oliver_Bearman_6F777B.png",
  "Oscar_Piastri_FF8000.png",
  "Pierre_Gasly_0096D6.png",
  "Sergio_Perez_666666.png",
  "Valtteri_Bottas_666666.png"
];

// Sort by the hex code appended to the filename so teammates are grouped together
const DRIVER_FILES = [...RAW_DRIVER_FILES].sort((a, b) => {
  const hexA = a.replace('.png', '').split('_').pop() || '';
  const hexB = b.replace('.png', '').split('_').pop() || '';
  return hexA.localeCompare(hexB);
});

export default function Drivers() {
  const { dispatch } = useRaceSession();
  const navigate = useNavigate();

  const handleSelectDriver = (filename: string, hexCode: string) => {
    dispatch({ 
      type: 'SET_SELECTED_DRIVER', 
      payload: { 
        path: `/Images/F1_Racers/${filename}`, 
        hex: `#${hexCode}` 
      } 
    });
    navigate('/dashboard');
  };

  return (
    <div className="h-screen w-screen bg-[#050505] overflow-hidden flex font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
           <div>
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">Select Driver</h1>
             <p className="text-white/40 text-xs tracking-widest uppercase mt-2">Driver telemetry configuration</p>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-20">
          {DRIVER_FILES.map((filename) => {
            // Extract Hex Code (e.g. Max_Verstappen_2463B5.png -> 2463B5)
            const parts = filename.replace('.png', '').split('_');
            const hexCode = parts[parts.length - 1];

            return (
              <div 
                key={filename}
                onClick={() => handleSelectDriver(filename, hexCode)}
                className={`group relative rounded-xl border-2 border-[#333] bg-[#0d0d0d] overflow-hidden cursor-pointer transition-all duration-300 driver-card-${hexCode}`}
              >
                <style>{`
                  .driver-card-${hexCode}:hover {
                    border-color: #${hexCode} !important;
                    box-shadow: 0 0 15px #${hexCode}, 0 0 40px #${hexCode}88, inset 0 0 15px #${hexCode}44 !important;
                    z-index: 50;
                  }
                  .driver-card-${hexCode} .glow-bg {
                    background: linear-gradient(to top, #${hexCode}66 0%, transparent 100%);
                    opacity: 0;
                  }
                  .driver-card-${hexCode}:hover .glow-bg {
                    opacity: 1;
                  }
                `}</style>
                
                <div className="w-full h-full aspect-[3/4] flex flex-col relative transition-all duration-300">
                  <div className="glow-bg absolute inset-0 z-0 transition-opacity duration-300"></div>
                  
                  <img 
                    src={`/Images/F1_Racers/${filename}`} 
                    alt={filename} 
                    className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-110 origin-bottom"
                  />
                  
                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20 rounded-tl m-2 z-20 pointer-events-none"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 rounded-tr m-2 z-20 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20 rounded-bl m-2 z-20 pointer-events-none"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20 rounded-br m-2 z-20 pointer-events-none"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
