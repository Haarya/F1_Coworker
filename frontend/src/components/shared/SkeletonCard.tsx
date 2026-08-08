interface SkeletonCardProps {
  height?: string;
  className?: string;
}

export default function SkeletonCard({ height = 'h-full', className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-bg-card rounded-md border border-border overflow-hidden relative ${height} ${className}`}>
      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
      
      {/* Generic layout pieces */}
      <div className="p-4 flex flex-col h-full">
        <div className="h-5 w-1/3 bg-white/5 rounded mb-4" />
        <div className="h-full flex-1 bg-white/5 rounded" />
      </div>
    </div>
  );
}
