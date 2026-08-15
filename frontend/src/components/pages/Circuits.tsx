import { useNavigate } from 'react-router-dom';
import { useRaceSession } from '../../context/RaceSessionContext';

const CIRCUIT_FILES = [
  "Abu_Dhabi_Circuit.avif",
  "Australia_Circuit.avif",
  "Austria_Circuit.avif",
  "Bahrain_Circuit.avif",
  "Baku_Circuit.avif",
  "Belgium_Circuit.avif",
  "Canada_Circuit.avif",
  "China_Circuit.avif",
  "Emilia_Romagna_Circuit.avif",
  "Great_Britain_Circuit.avif",
  "Hungary_Circuit.avif",
  "Italy_Circuit.avif",
  "Japan_Circuit.avif",
  "Las_Vegas_Circuit.avif",
  "Miami_Circuit.avif",
  "Monaco_Circuit.avif",
  "Netherlands_Circuit.avif",
  "Qatar_Circuit.avif",
  "Saudi_Arabia_Circuit.avif",
  "Singapore_Circuit.avif",
  "Spain_Circuit.avif"
];

export default function Circuits() {
  const { dispatch } = useRaceSession();
  const navigate = useNavigate();

  const handleSelectCircuit = (filename: string) => {
    dispatch({ 
      type: 'SET_SELECTED_CIRCUIT', 
      payload: `/Images/F1_circuit/${filename}` 
    });
    navigate('/dashboard');
  };

  const getDisplayName = (filename: string) => {
    return filename.replace('_Circuit.avif', '').replace('_', ' ').toUpperCase();
  };

  return (
    <div className="flex-1 h-full w-full bg-[#050505] overflow-hidden flex font-sans">
      
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        
        <div className="flex justify-between items-end mb-8 border-b border-[#E60012]/30 pb-4">
           <div>
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(230,0,18,0.4)]">Select Circuit</h1>
             <p className="text-[#E60012]/60 text-xs tracking-widest uppercase mt-2">Track telemetry configuration</p>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pb-20">
          {CIRCUIT_FILES.map((filename) => {
            const name = getDisplayName(filename);

            return (
              <div 
                key={filename}
                onClick={() => handleSelectCircuit(filename)}
                className="group flex flex-col items-center cursor-pointer"
              >
                {/* Circuit Frame */}
                <div className="w-full aspect-[4/3] rounded-2xl border-2 border-white/5 bg-[#0d0d0d] flex items-center justify-center p-6 relative overflow-hidden transition-all duration-300 group-hover:border-[#E60012] group-hover:shadow-[0_0_25px_rgba(230,0,18,0.3)] shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                  <div className="absolute inset-0 bg-[#E60012]/0 group-hover:bg-[#E60012]/5 transition-colors duration-300"></div>
                  <img 
                    src={`/Images/F1_circuit/${filename}`} 
                    alt={name} 
                    className="w-full h-full object-contain filter invert opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)]"
                  />
                  
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#E60012]/50 rounded-tl-lg m-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E60012]/50 rounded-tr-lg m-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#E60012]/50 rounded-bl-lg m-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#E60012]/50 rounded-br-lg m-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Circuit Name */}
                <span className="mt-4 text-white/50 text-[10px] font-bold tracking-widest uppercase transition-colors group-hover:text-white group-hover:drop-shadow-[0_0_10px_white]">
                  {name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
