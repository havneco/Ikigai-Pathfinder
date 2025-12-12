import React from 'react';

interface VennDiagramProps {
  activeSection?: string;
  labels?: {
    passion?: string;
    mission?: string;
    profession?: string;
    vocation?: string;
    ikigai?: string;
  };
  mode?: 'pathfinder' | 'spark';
}

export const VennDiagram: React.FC<VennDiagramProps> = ({ activeSection, labels, mode = 'pathfinder' }) => {
  const isSpark = mode === 'spark';

  // Label Configuration
  const defaultLabels = isSpark ? {
    top: "Vision & Roadmap",
    left: "Skill Application",
    right: "Audience Engagement",
    bottom: "Tools & Resources",
    center: "SPARK"
  } : {
    top: "What You Love",
    left: "What You Are Good At",
    right: "What The World Needs",
    bottom: "What You Can Be Paid For",
    center: "IKIGAI"
  };

  return (
    <div className="relative w-full aspect-square flex items-center justify-center select-none group">

      {/* BACKGROUND IMAGE ASSET */}
      <div className={`absolute inset-0 w-full h-full transition-all duration-700 ${isSpark ? 'filter invert hue-rotate-[160deg] saturate-[3] contrast-125' : ''}`}>
        <img
          src="/PathfinderVenn.png"
          alt="Venn Diagram"
          className="w-full h-full object-contain drop-shadow-2xl animate-in fade-in zoom-in-95 duration-1000"
        />
      </div>

      {/* GLOW EFFECTS (Overlay) */}
      {isSpark && (
        <div className="absolute inset-0 bg-amber-500/10 mix-blend-screen rounded-full blur-3xl animate-pulse"></div>
      )}

      {/* LABELS CONTAINER */}
      <div className={`absolute inset-0 w-full h-full font-serif font-bold text-center flex flex-col items-center justify-center ${isSpark ? 'text-amber-100' : 'text-slate-800'}`}>

        {/* TOP */}
        <div className="absolute top-[8%] text-[0.6rem] md:text-[0.7rem] tracking-widest uppercase opacity-80 max-w-[20%] leading-tight">
          {defaultLabels.top}
        </div>

        {/* LEFT */}
        <div className="absolute left-[4%] text-[0.6rem] md:text-[0.7rem] tracking-widest uppercase opacity-80 max-w-[20%] leading-tight">
          {defaultLabels.left}
        </div>

        {/* RIGHT */}
        <div className="absolute right-[4%] text-[0.6rem] md:text-[0.7rem] tracking-widest uppercase opacity-80 max-w-[20%] leading-tight">
          {defaultLabels.right}
        </div>

        {/* BOTTOM */}
        <div className="absolute bottom-[8%] text-[0.6rem] md:text-[0.7rem] tracking-widest uppercase opacity-80 max-w-[20%] leading-tight">
          {defaultLabels.bottom}
        </div>

        {/* CENTER (The Core) */}
        <div className={`absolute z-10 transition-all duration-500 transform group-hover:scale-110 ${isSpark ? 'text-white drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'text-slate-900 drop-shadow-md'}`}>
          <h1 className="text-2xl md:text-3xl tracking-widest font-bold">
            {defaultLabels.center}
          </h1>
        </div>

        {/* INTERSECTIONS */}
        {/* Top-Left */}
        <div className={`absolute top-[30%] left-[28%] text-[0.5rem] md:text-[0.6rem] font-sans font-bold tracking-wider opacity-60 ${isSpark ? 'text-amber-200' : 'text-slate-600'}`}>
          {isSpark ? "DEVELOP" : "PASSION"}
        </div>
        {/* Top-Right */}
        <div className={`absolute top-[30%] right-[28%] text-[0.5rem] md:text-[0.6rem] font-sans font-bold tracking-wider opacity-60 ${isSpark ? 'text-amber-200' : 'text-slate-600'}`}>
          {isSpark ? "MARKET" : "MISSION"}
        </div>
        {/* Bottom-Left */}
        <div className={`absolute bottom-[30%] left-[28%] text-[0.5rem] md:text-[0.6rem] font-sans font-bold tracking-wider opacity-60 ${isSpark ? 'text-amber-200' : 'text-slate-600'}`}>
          {isSpark ? "PRODUCE" : "PROFESSION"}
        </div>
        {/* Bottom-Right */}
        <div className={`absolute bottom-[30%] right-[28%] text-[0.5rem] md:text-[0.6rem] font-sans font-bold tracking-wider opacity-60 ${isSpark ? 'text-amber-200' : 'text-slate-600'}`}>
          {isSpark ? "SCALE" : "VOCATION"}
        </div>

      </div>
    </div>
  );
};