export default function CarPlaceholder() {
  return (
    <div className="w-full h-full bg-[#080808] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-[#E31D2B]/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-t-2 border-[#E31D2B] rounded-full animate-spin" />
        </div>
        <p className="text-sm text-white/40 uppercase tracking-widest">Loading 3D View...</p>
      </div>
    </div>
  );
}
