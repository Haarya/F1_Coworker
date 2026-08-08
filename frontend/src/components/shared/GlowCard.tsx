import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  activeColor?: string;
}

export default function GlowCard({ children, activeColor }: Props) {
  return (
    <div 
      className="relative rounded-md border bg-bg-card transition-all duration-300"
      style={{ 
        borderColor: activeColor || 'var(--color-border)',
        boxShadow: activeColor ? `0 0 15px ${activeColor}4D` : 'none'
      }}
    >
      {children}
    </div>
  );
}
