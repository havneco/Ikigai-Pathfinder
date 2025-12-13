import React from 'react';

interface VennDiagramProps {
  activeSection?: string;
  labels?: any;
  mode?: 'pathfinder' | 'spark';
}

export const VennDiagram: React.FC<VennDiagramProps> = ({ mode = 'pathfinder', labels }) => {
  const isSpark = mode === 'spark';
  const [displayText, setDisplayText] = React.useState(isSpark ? 'SPARK' : 'IKIGAI');
  const [isFading, setIsFading] = React.useState(false);

  // Rotate between Mode Name and Project Name (if available)
  React.useEffect(() => {
    if (!labels?.centerLabel) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setDisplayText(prev => prev === (isSpark ? 'SPARK' : 'IKIGAI') ? labels.centerLabel : (isSpark ? 'SPARK' : 'IKIGAI'));
        setIsFading(false);
      }, 500);
    }, 5000); // 5 seconds per text

    return () => clearInterval(interval);
  }, [labels?.centerLabel, isSpark]);

  return (
    <div className="relative w-full aspect-square flex items-center justify-center select-none group">

      {/* IKIGAI DIAGRAM (Visible in Pathfinder/Default) */}
      <div className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${isSpark ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <img
          src="/IkigaiVenn.png"
          alt="Ikigai Diagram"
          className="w-full h-full object-contain drop-shadow-2xl mix-blend-multiply"
        />
      </div>

      {/* SPARK DIAGRAM (Visible in Spark Mode) */}
      <div className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${isSpark ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Optional Glow for Spark Mode */}
        <div className="absolute inset-0 bg-amber-500/20 mix-blend-screen rounded-full blur-3xl animate-pulse"></div>
        <img
          src="/SparkVenn.png"
          alt="Spark Diagram"
          className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(245,158,11,0.5)] mix-blend-screen"
        />
      </div>

      {/* CENTER OVERLAY (Rotates Text) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-[18%] h-[18%] rounded-full flex items-center justify-center text-center p-2 transition-all duration-500 z-10 
            ${isSpark
            ? 'bg-black/40 backdrop-blur-sm text-amber-100 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]'
            : 'bg-[#fffbf0]/80 backdrop-blur-sm text-slate-800 shadow-inner'
          }`}>
          <span className={`font-serif font-bold text-[clamp(0.5rem,1.5vw,1rem)] leading-tight transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            {displayText}
          </span>
        </div>
      </div>

    </div>
  );
};