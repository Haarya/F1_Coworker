import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 24, 
  text = 'Loading telemetry...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  
  const content = (
    <div className="flex flex-col items-center justify-center text-text-secondary">
      <Loader2 size={size} className="animate-spin text-accent-red mb-3" />
      {text && <span className="text-sm font-mono tracking-wider">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      {content}
    </div>
  );
}
