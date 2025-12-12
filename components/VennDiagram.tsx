import React from 'react';

interface VennDiagramProps {
  activeSection?: string;
  labels?: any;
  mode?: 'pathfinder' | 'spark';
}

export const VennDiagram: React.FC<VennDiagramProps> = ({ mode = 'pathfinder' }) => {
  const isSpark = mode === 'spark';

  return (
    <div className="relative w-full aspect-square flex items-center justify-center select-none group">

      {/* IKIGAI DIAGRAM (Visible in Pathfinder/Default) */}
      <div className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${isSpark ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <img
          src="/IkigaiVenn.png"
          alt="Ikigai Diagram"
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </div>

      {/* SPARK DIAGRAM (Visible in Spark Mode) */}
      <div className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${isSpark ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Optional Glow for Spark Mode */}
        <div className="absolute inset-0 bg-amber-500/20 mix-blend-screen rounded-full blur-3xl animate-pulse"></div>
        <img
          src="/SparkVenn.png"
          alt="Spark Diagram"
          className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]"
        />
      </div>

    </div>
  );
};