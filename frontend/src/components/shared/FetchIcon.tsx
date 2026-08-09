import { useEffect, useState } from 'react';

export default function FetchIcon({ src, className }: { src: string, className?: string }) {
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    fetch(src)
      .then(res => res.text())
      .then(text => {
        // Strip hardcoded fills and apply currentColor so Tailwind styling works natively
        let cleaned = text.replace(/fill="[^"]*"/g, 'fill="currentColor"');
        // Make sure the SVG scales perfectly to the wrapper
        cleaned = cleaned.replace('<svg ', '<svg style="width: 100%; height: 100%;" ');
        setSvg(cleaned);
      })
      .catch(err => console.error("Error loading SVG:", err));
  }, [src]);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
