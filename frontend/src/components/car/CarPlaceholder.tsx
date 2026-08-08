import { ShieldAlert } from 'lucide-react';

export default function CarPlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 to-bg-dark border border-border/50 rounded-lg p-6 relative overflow-hidden group">
      {/* Decorative background grids */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
      
      {/* Wireframe car abstraction */}
      <div className="relative z-10 w-48 h-24 border-2 border-dashed border-gray-600 rounded-2xl flex items-center justify-center mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
        <ShieldAlert className="text-gray-500 mr-2" />
        <span className="text-gray-400 font-mono text-sm tracking-widest">NO .GLB LOADED</span>
        
        {/* Scanning line animation */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-red/50 shadow-[0_0_10px_rgba(225,6,0,0.8)] animate-pulse" style={{ animation: 'scan 2s linear infinite' }}>
          <style>{`
            @keyframes scan {
              0% { left: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { left: 100%; opacity: 0; }
            }
          `}</style>
        </div>
      </div>
      
      <div className="relative z-10 text-center">
        <h3 className="text-white font-bold tracking-wider mb-1">3D CAR MODEL READY</h3>
        <p className="text-text-secondary text-xs max-w-[200px] mx-auto leading-relaxed">
          Drop a `.glb` file to visualize real-time stress heatmaps on the chassis.
        </p>
      </div>
    </div>
  );
}
