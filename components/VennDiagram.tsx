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

  // Helper to shorten text to 2 words max
  const formatLabel = (text: string) => {
    return text.split(' ').slice(0, 2).join(' ');
  };

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
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className={`w-[15%] h-[15%] rounded-full flex items-center justify-center text-center p-1 transition-all duration-500 
            ${isSpark
            ? 'bg-black/60 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)]'
            : 'bg-[#fdfbf6]/90 backdrop-blur-sm shadow-[inset_0_0_10px_rgba(217,119,6,0.1)]'
          }`}>
          <span className={`font-serif font-bold text-[clamp(0.4rem,1.2vw,0.9rem)] leading-none transition-opacity duration-500 uppercase tracking-wider
                ${isFading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}
                ${isSpark ? 'text-amber-100 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'text-[#8b6e4e]'}
            `}>
            {formatLabel(displayText)}
          </span>
        </div>
      </div>

    </div>
  );
};