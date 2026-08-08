import { stressToColor } from '../../utils/colorScale';

interface Props {
  clIndex: number;
  label?: string;
}

export default function StatusBadge({ clIndex, label }: Props) {
  const color = stressToColor(clIndex);
  
  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-bold uppercase tracking-wider"
      style={{ borderColor: color, color: color, backgroundColor: `${color}1A` }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label || `CL: ${Math.round(clIndex)}`}
    </div>
  );
}
