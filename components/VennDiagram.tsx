import React from 'react';

interface VennProps {
  labels?: {
    passion?: string;
    mission?: string;
    profession?: string;
    vocation?: string;
    ikigai?: string;
  };
  activeSection?: 'love' | 'good' | 'world' | 'paid' | 'center' | 'none';
}

const VennDiagram: React.FC<VennProps> = ({ labels, activeSection = 'none' }) => {
  
  const getOpacity = (section: string) => {
    if (activeSection === 'none' || activeSection === 'center') return 0.6;
    return activeSection === section ? 0.8 : 0.2;
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
      <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-xl">
        {/* Top Circle: LOVE */}
        <circle
          cx="250"
          cy="170"
          r="120"
          fill="#FF6B6B"
          fillOpacity={getOpacity('love')}
          className="transition-all duration-500"
        />
        {/* Right Circle: NEEDS */}
        <circle
          cx="330"
          cy="290"
          r="120"
          fill="#45B7D1"
          fillOpacity={getOpacity('world')}
           className="transition-all duration-500"
        />
        {/* Left Circle: GOOD AT */}
        <circle
          cx="170"
          cy="290"
          r="120"
          fill="#4ECDC4"
          fillOpacity={getOpacity('good')}
           className="transition-all duration-500"
        />
        {/* Bottom Circle: PAID FOR */}
        <circle
          cx="250"
          cy="370"
          r="120"
          fill="#F7B731"
          fillOpacity={getOpacity('paid')}
           className="transition-all duration-500"
        />
        
        {/* Text Labels */}
        <text x="250" y="100" textAnchor="middle" className="text-xs font-bold fill-rose-900 opacity-80 uppercase tracking-widest">Love</text>
        <text x="70" y="290" textAnchor="middle" className="text-xs font-bold fill-teal-900 opacity-80 uppercase tracking-widest">Good At</text>
        <text x="430" y="290" textAnchor="middle" className="text-xs font-bold fill-sky-900 opacity-80 uppercase tracking-widest">Needs</text>
        <text x="250" y="470" textAnchor="middle" className="text-xs font-bold fill-amber-900 opacity-80 uppercase tracking-widest">Paid</text>
        
        {/* Intersection Labels (Only show on result) */}
        {labels && (
          <>
            <text x="250" y="290" textAnchor="middle" dominantBaseline="middle" className="text-sm font-black fill-white drop-shadow-md">IKIGAI</text>
            
            <text x="210" y="210" textAnchor="middle" className="text-[10px] font-semibold fill-white/90">Passion</text>
            <text x="290" y="210" textAnchor="middle" className="text-[10px] font-semibold fill-white/90">Mission</text>
            <text x="210" y="370" textAnchor="middle" className="text-[10px] font-semibold fill-white/90">Profession</text>
            <text x="290" y="370" textAnchor="middle" className="text-[10px] font-semibold fill-white/90">Vocation</text>
          </>
        )}
      </svg>
      
      {labels?.ikigai && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
           </div>
        </div>
      )}
    </div>
  );
};

export default VennDiagram;