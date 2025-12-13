import React, { useEffect, useState } from 'react';
import { VennDiagram } from './VennDiagram';

const HeroIkigai: React.FC<{ className?: string }> = ({ className }) => {
  const [mode, setMode] = useState<'pathfinder' | 'spark'>('pathfinder');

  useEffect(() => {
    // Pulse between Pathfinder (Ikigai) and Spark modes every 4 seconds
    const interval = setInterval(() => {
      setMode(prev => prev === 'pathfinder' ? 'spark' : 'pathfinder');
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative aspect-square flex items-center justify-center select-none ${className || 'w-[350px] md:w-[450px]'}`}>
      {/* Reusing the production Venn component for brand consistency */}
      <VennDiagram
        mode={mode}
        labels={{
          centerLabel: mode === 'pathfinder' ? 'Discover Purpose' : 'Ignite Venture'
        }}
      />
    </div>
  );
};

export default HeroIkigai;