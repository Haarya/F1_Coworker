import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRaceSession } from '../../context/RaceSessionContext';

export default function Sidebar() {
  const { state, dispatch } = useRaceSession();
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);
  const sessions = ['Practice', 'Qualifying', 'Main Race'];

  const isExecutionReady = state.selectedDriver && state.selectedCircuit && state.selectedYear && state.selectedSession;

  return (
    <>
      <div className="w-[90px] h-full flex flex-col py-6 pl-6 pr-2 z-50">
        <div className="w-full h-full bg-[#0a0a0a] border-2 border-white/5 rounded-2xl flex flex-col items-center py-6 shadow-[0_0_25px_rgba(0,0,0,1)] relative overflow-hidden justify-between">
        
        {/* Subtle red glow inside the sidebar */}
        <div className="absolute inset-0 bg-[#E60012]/5 blur-3xl opacity-50 pointer-events-none"></div>

        {/* Top Section: Navigation Icons */}
        <div className="flex flex-col gap-4 w-full items-center relative z-10 flex-1 overflow-y-auto no-scrollbar">
          
          <Link to="/dashboard" className="group relative w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#E60012] rounded-xl cursor-pointer hover:scale-105 transition-all shadow-[0_0_20px_rgba(230,0,18,0.5)]">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </Link>

          <div className="w-6 h-px bg-white/10 my-1 flex-shrink-0"></div>

          {/* Uploaded PNG Icons */}
          <Link to="/drivers" className="group relative w-12 h-12 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all">
            <div className="absolute inset-0 bg-[#E60012]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_15px_rgba(230,0,18,0.4)]"></div>
            <img src="/Icons/icon_driver.png" alt="Driver" className="w-6 h-6 object-contain invert opacity-40 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(230,0,18,1)] transition-all relative z-10" />
          </Link>

          <Link to="/circuits" className="group relative w-12 h-12 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all">
            <div className="absolute inset-0 bg-[#E60012]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_15px_rgba(230,0,18,0.4)]"></div>
            <img src="/Icons/icon_circuit.png" alt="Circuit" className="w-6 h-6 object-contain invert opacity-40 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(230,0,18,1)] transition-all relative z-10" />
          </Link>

          <div className="relative flex-shrink-0">
            <button 
              onClick={() => { setShowYearDropdown(true); setShowSessionDropdown(false); }}
              className="group relative w-12 h-12 flex items-center justify-center cursor-pointer transition-all"
            >
              <div className="absolute inset-0 bg-[#E60012]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_15px_rgba(230,0,18,0.4)]"></div>
              <img src="/Icons/icon_calendar.png" alt="Calendar" className="w-6 h-6 object-contain invert opacity-40 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(230,0,18,1)] transition-all relative z-10" />
            </button>
          </div>

          <div className="relative flex-shrink-0">
            <button 
              onClick={() => { setShowSessionDropdown(true); setShowYearDropdown(false); }}
              className="group relative w-12 h-12 flex items-center justify-center cursor-pointer transition-all"
            >
              <div className="absolute inset-0 bg-[#E60012]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_15px_rgba(230,0,18,0.4)]"></div>
              <img src="/Icons/icon_session.png" alt="Session" className="w-6 h-6 object-contain invert opacity-40 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(230,0,18,1)] transition-all relative z-10" />
            </button>
          </div>
        </div>

        {/* Bottom Section: F1 Button */}
        <div className="flex items-center justify-center w-full relative z-10 mt-4 flex-shrink-0">
          <button 
            disabled={!isExecutionReady}
            className={`group relative w-14 h-14 flex items-center justify-center transition-all ${isExecutionReady ? 'cursor-pointer hover:scale-110' : 'opacity-20 cursor-not-allowed grayscale'}`}
          >
            {isExecutionReady && <div className="absolute inset-0 bg-[#E60012]/20 rounded-full blur-md group-hover:bg-[#E60012]/40 transition-colors"></div>}
            <img src="/Icons/icon_f1_button.png" alt="Play" className={`w-8 h-8 object-contain transition-all relative z-10 invert ${isExecutionReady ? 'drop-shadow-[0_0_10px_rgba(230,0,18,1)]' : 'opacity-20'}`} />
          </button>
        </div>
      </div>
    </div>

      {/* Pop-up Modals for Selection */}
      {showYearDropdown && (
        <>
          {/* Invisible overlay to detect clicks outside the popover */}
          <div className="fixed inset-0 z-[90]" onClick={() => setShowYearDropdown(false)}></div>
          {/* Small floating popover next to the sidebar */}
          <div className="fixed z-[100] left-[110px] top-[30%] bg-[#0a0a0a] border-2 border-[#E60012]/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(230,0,18,0.2)] max-w-[300px] w-full max-h-[50vh] flex flex-col animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] border-b border-white/5 pb-2">Select Year</h3>
            <div className="grid grid-cols-4 gap-2 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E60012 #1a1a1a' }}>
              {years.map(year => (
                <button 
                  key={year} 
                  onClick={() => { dispatch({ type: 'SET_SELECTED_YEAR', payload: year.toString() }); setShowYearDropdown(false); }}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${state.selectedYear === year.toString() ? 'bg-[#E60012]/20 border-[#E60012] text-white shadow-[0_0_10px_rgba(230,0,18,0.4)]' : 'border-white/5 bg-white/5 text-white/50 hover:bg-[#E60012]/10 hover:border-[#E60012]/50 hover:text-white'}`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {showSessionDropdown && (
        <>
          {/* Invisible overlay to detect clicks outside the popover */}
          <div className="fixed inset-0 z-[90]" onClick={() => setShowSessionDropdown(false)}></div>
          {/* Small floating popover next to the sidebar */}
          <div className="fixed z-[100] left-[110px] top-[40%] bg-[#0a0a0a] border-2 border-[#E60012]/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(230,0,18,0.2)] max-w-[240px] w-full flex flex-col animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] border-b border-white/5 pb-2">Select Session</h3>
            <div className="flex flex-col gap-2">
              {sessions.map(session => (
                <button 
                  key={session} 
                  onClick={() => { dispatch({ type: 'SET_SELECTED_SESSION', payload: session }); setShowSessionDropdown(false); }}
                  className={`py-3 px-4 rounded-lg text-left font-bold transition-all border text-sm uppercase tracking-widest ${state.selectedSession === session ? 'bg-[#E60012]/20 border-[#E60012] text-white shadow-[0_0_10px_rgba(230,0,18,0.4)]' : 'border-white/5 bg-white/5 text-white/50 hover:bg-[#E60012]/10 hover:border-[#E60012]/50 hover:text-white'}`}
                >
                  {session}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
