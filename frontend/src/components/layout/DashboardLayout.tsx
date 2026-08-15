import { Outlet } from 'react-router-dom';
import React, { useMemo } from 'react';
import Sidebar from './Sidebar';
import { useRaceSession } from '../../context/RaceSessionContext';

export default function DashboardLayout() {
  const { state } = useRaceSession();

  const themeVars = useMemo(() => {
    const hex = state.driverGlowHex || '#E60012';
    return {
      '--theme-base': hex,
      '--theme-10': `${hex}1A`,
      '--theme-20': `${hex}33`,
      '--theme-30': `${hex}4D`,
      '--theme-40': `${hex}66`,
      '--theme-50': `${hex}80`,
      '--theme-60': `${hex}99`,
      '--theme-70': `${hex}B3`,
      '--theme-80': `${hex}CC`,
      '--theme-90': `${hex}E6`,
    } as React.CSSProperties;
  }, [state.driverGlowHex]);

  return (
    <div className="h-screen w-screen bg-[#050505] overflow-hidden flex font-sans" style={themeVars}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}
