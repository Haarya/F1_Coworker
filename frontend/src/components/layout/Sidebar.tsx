import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRaceSession } from '../../context/RaceSessionContext';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { state, dispatch } = useRaceSession();
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const location = useLocation();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);
  const sessions = ['Practice', 'Qualifying', 'Main Race'];

  const isExecutionReady = state.selectedDriver && state.selectedCircuit && state.selectedYear && state.selectedSession;
  
  const [activeItem, setActiveItem] = useState(location.pathname === '/' ? '/dashboard' : location.pathname);

  // Keep activeItem synced with route changes (e.g. browser back button or clicking links)
  useEffect(() => {
    const path = location.pathname === '/' ? '/dashboard' : location.pathname;
    if (['/dashboard', '/drivers', '/circuits'].includes(path)) {
      setActiveItem(path);
    }
  }, [location.pathname]);

  const renderActiveIndicator = (id: string) => {
    if (activeItem !== id) return null;
    return (
      <motion.div 
        layoutId="sidebar-active"
        className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)] z-0"
        initial={false}
        transition={{ type: "spring", stiffness: 200, damping: 22, mass: 0.8 }}
      />
    );
  };

  return (
    <>
      <div className="w-[110px] h-full flex flex-col py-6 pl-6 pr-2 z-50">
        <div className="w-full h-full bg-[#0d0d0d] border border-[var(--theme-30)] hover:border-[var(--theme-50)] rounded-2xl flex flex-col items-center py-6 shadow-[0_0_15px_var(--theme-10)] hover:shadow-[0_0_25px_var(--theme-30)] transition-all duration-300 relative overflow-hidden justify-between">
        
        {/* Subtle red glow inside the sidebar */}
        <div className="absolute inset-0 bg-[#E60012]/5 blur-3xl opacity-50 pointer-events-none"></div>

        {/* Top Section: Navigation Icons */}
        <div className="flex flex-col gap-4 w-full items-center relative z-10 flex-1 overflow-y-auto no-scrollbar">
          
          <Link to="/dashboard" onClick={() => setActiveItem('/dashboard')} className="group relative w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl cursor-pointer hover:scale-105 transition-all">
            {renderActiveIndicator('/dashboard')}
            <svg viewBox="0 0 24 24" width="22" height="22" fill={activeItem === '/dashboard' ? "white" : "white"} className={`relative z-10 transition-colors ${activeItem !== '/dashboard' && 'opacity-60 group-hover:opacity-100'}`}>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </Link>

          <div className="w-6 h-px bg-white/10 my-1 flex-shrink-0"></div>

          {/* Uploaded PNG Icons */}
          <Link to="/drivers" onClick={() => setActiveItem('/drivers')} className="group relative w-12 h-12 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all">
            {renderActiveIndicator('/drivers')}
            <div className="absolute inset-0 bg-[#E60012]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_15px_rgba(230,0,18,0.4)] z-0"></div>
            <img src="/Icons/icon_driver.png" alt="Driver" className={`w-6 h-6 object-contain invert transition-all relative z-10 ${activeItem === '/drivers' ? 'opacity-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'opacity-40 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(230,0,18,1)]'}`} />
          </Link>

          <Link to="/circuits" onClick={() => setActiveItem('/circuits')} className="group relative w-12 h-12 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all">
            {renderActiveIndicator('/circuits')}
            <div className="absolute inset-0 bg-[#E60012]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_15px_rgba(230,0,18,0.4)] z-0"></div>
            <img src="/Icons/icon_circuit.png" alt="Circuit" className={`w-6 h-6 object-contain invert transition-all relative z-10 ${activeItem === '/circuits' ? 'opacity-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'opacity-40 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(230,0,18,1)]'}`} />
          </Link>

          <div className="relative flex-shrink-0">
            <button 
              onClick={() => { setShowYearDropdown(!showYearDropdown); setShowSessionDropdown(false); setActiveItem('year'); }}
              className="group relative w-12 h-12 flex items-center justify-center cursor-pointer transition-all"
            >
              {renderActiveIndicator('year')}
              <div className="absolute inset-0 bg-[#E60012]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_15px_rgba(230,0,18,0.4)] z-0"></div>
              <img src="/Icons/icon_calendar.png" alt="Calendar" className={`w-6 h-6 object-contain invert transition-all relative z-10 ${activeItem === 'year' ? 'opacity-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'opacity-40 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(230,0,18,1)]'}`} />
            </button>
          </div>

          <div className="relative flex-shrink-0">
            <button 
              onClick={() => { setShowSessionDropdown(!showSessionDropdown); setShowYearDropdown(false); setActiveItem('session'); }}
              className="group relative w-12 h-12 flex items-center justify-center cursor-pointer transition-all"
            >
              {renderActiveIndicator('session')}
              <div className="absolute inset-0 bg-[#E60012]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_15px_rgba(230,0,18,0.4)] z-0"></div>
              <img src="/Icons/icon_session.png" alt="Session" className={`w-6 h-6 object-contain invert transition-all relative z-10 ${activeItem === 'session' ? 'opacity-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'opacity-40 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(230,0,18,1)]'}`} />
            </button>
          </div>
        </div>

        {/* Bottom Section: F1 Button */}
        <div className="flex flex-col items-center justify-center w-full relative z-10 mt-4 flex-shrink-0 mb-4 gap-2">
          <motion.button 
            disabled={!isExecutionReady}
            whileHover={isExecutionReady ? { scale: 1.05 } : {}}
            whileTap={isExecutionReady ? { scale: 0.95 } : {}}
            className={`group relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isExecutionReady 
                ? 'cursor-pointer bg-[#E60012]/5 border border-[#E60012]/30 shadow-[0_0_15px_rgba(230,0,18,0.1)] hover:bg-[#E60012]/20 hover:border-[#E60012]/80 hover:shadow-[0_0_30px_rgba(230,0,18,0.4)]' 
                : 'opacity-40 cursor-not-allowed bg-black/20 border border-white/5 grayscale'
            }`}
          >
            <img 
               src="/Icons/icon_f1_button.png" 
               alt="Execute" 
               className={`w-9 h-9 object-contain relative z-10 transition-all duration-300 ${isExecutionReady ? 'drop-shadow-[0_0_8px_rgba(230,0,18,0.5)] group-hover:brightness-125 group-hover:drop-shadow-[0_0_15px_rgba(230,0,18,0.8)]' : ''}`} 
            />
          </motion.button>
          
          <div className={`text-[9px] font-f1 font-black uppercase tracking-[0.2em] transition-all duration-300 ${isExecutionReady ? 'text-[#E60012] drop-shadow-[0_0_5px_rgba(230,0,18,0.5)]' : 'text-white/20'}`}>
            Execute
          </div>
        </div>
      </div>
    </div>

      {/* Pop-up Modals for Selection */}
      {showYearDropdown && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setShowYearDropdown(false)}></div>
          <div className="fixed z-[100] left-[130px] top-[30%] bg-[#0a0a0a] border-2 border-[#E60012]/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(230,0,18,0.2)] max-w-[300px] w-full max-h-[50vh] flex flex-col animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] border-b border-white/5 pb-2">Select Year</h3>
            <div className="grid grid-cols-4 gap-2 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E60012 #1a1a1a' }}>
              {years.map(year => (
                <button 
                  key={year} 
                  onClick={() => { dispatch({ type: 'SET_SELECTED_YEAR', payload: year }); setShowYearDropdown(false); }}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${state.selectedYear === year ? 'bg-[#E60012]/20 border-[#E60012] text-white shadow-[0_0_10px_rgba(230,0,18,0.4)]' : 'border-white/5 bg-white/5 text-white/50 hover:bg-[#E60012]/10 hover:border-[#E60012]/50 hover:text-white'}`}
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
          <div className="fixed inset-0 z-[90]" onClick={() => setShowSessionDropdown(false)}></div>
          <div className="fixed z-[100] left-[130px] top-[40%] bg-[#0a0a0a] border-2 border-[#E60012]/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(230,0,18,0.2)] max-w-[240px] w-full flex flex-col animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
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
