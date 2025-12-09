import React, { useEffect, useState, useRef } from 'react';

const HeroIkigai: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Reduced sensitivity (divide by 60) for subtler, more stable movement
      const x = (e.clientX - rect.left - rect.width / 2) / 60;
      const y = (e.clientY - rect.top - rect.height / 2) / 60;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const parallax = (factor: number) => ({
    transform: `translate(${mousePos.x * factor}px, ${mousePos.y * factor}px)`,
  });

  // Configuration for perfect geometric alignment
  // Container: 500x500
  // Center: 250, 250
  // Circle Size: 320px (Radius 160)
  // Offset from Center: 85px
  const SIZE = 320; 
  const RADIUS = 160;
  const OFFSET = 85;
  const CENTER = 250;

  // Top-Left coordinates for absolute positioning
  const topPos = { left: CENTER - RADIUS, top: CENTER - RADIUS - OFFSET };
  const rightPos = { left: CENTER - RADIUS + OFFSET, top: CENTER - RADIUS };
  const bottomPos = { left: CENTER - RADIUS, top: CENTER - RADIUS + OFFSET };
  const leftPos = { left: CENTER - RADIUS - OFFSET, top: CENTER - RADIUS };

  return (
    <div ref={containerRef} className="relative w-[500px] h-[500px] flex items-center justify-center select-none scale-90 md:scale-100">
      
      {/* Container for the circles */}
      <div className="relative w-full h-full">
        
        {/* Circles Layer - Moving cohesively to preserve intersection shape */}
        <div className="absolute inset-0 transition-transform duration-100 ease-out" style={parallax(0.4)}>
            {/* TOP: LOVE (Rose/Red) */}
            <div 
            className="absolute rounded-full bg-rose-500 mix-blend-multiply filter blur-xl opacity-80"
            style={{
                width: SIZE, height: SIZE,
                left: topPos.left, top: topPos.top,
            }}
            >
            <div className="absolute top-12 left-1/2 -translate-x-1/2 text-rose-900 font-serif font-bold tracking-[0.2em] text-sm">LOVE</div>
            </div>

            {/* RIGHT: NEEDS (Sky/Blue) */}
            <div 
            className="absolute rounded-full bg-sky-500 mix-blend-multiply filter blur-xl opacity-80"
            style={{
                width: SIZE, height: SIZE,
                left: rightPos.left, top: rightPos.top,
            }}
            >
            <div className="absolute top-1/2 right-12 -translate-y-1/2 text-sky-900 font-serif font-bold tracking-[0.2em] text-sm rotate-90">NEEDS</div>
            </div>

            {/* BOTTOM: PAID (Amber/Orange) */}
            <div 
            className="absolute rounded-full bg-amber-500 mix-blend-multiply filter blur-xl opacity-80"
            style={{
                width: SIZE, height: SIZE,
                left: bottomPos.left, top: bottomPos.top,
            }}
            >
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-amber-900 font-serif font-bold tracking-[0.2em] text-sm">PAID</div>
            </div>

            {/* LEFT: SKILL (Teal/Emerald) */}
            <div 
            className="absolute rounded-full bg-teal-500 mix-blend-multiply filter blur-xl opacity-80"
            style={{
                width: SIZE, height: SIZE,
                left: leftPos.left, top: leftPos.top,
            }}
            >
            <div className="absolute top-1/2 left-12 -translate-y-1/2 text-teal-900 font-serif font-bold tracking-[0.2em] text-sm -rotate-90">SKILL</div>
            </div>
        </div>

        {/* Center: IKIGAI */}
        {/* The true intersection - Absolute Center */}
        {/* Adjusted Translate Y to -55% to fix optical centering (fonts often sit low) */}
        {/* Removed Parallax or reduced it significantly to keep it anchored to the center of the 'hole' */}
        <div 
          className="absolute top-1/2 left-1/2 w-40 h-40 flex items-center justify-center z-10 mix-blend-normal transition-transform duration-100 ease-out"
          style={{
              ...parallax(0.2), // Moves slightly less than circles to create depth, but follows same direction
              transform: `translate(calc(-50% + ${mousePos.x * 0.2}px), calc(-55% + ${mousePos.y * 0.2}px))` // -55% Y accounts for baseline visual weight
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center group cursor-pointer">
            {/* White glow behind text to ensure readability over mixed colors */}
            <div className="absolute inset-0 bg-white/60 rounded-full blur-2xl group-hover:bg-white/80 transition-colors duration-500 scale-75"></div>
            <div className="relative text-4xl font-serif font-black text-slate-900 tracking-widest group-hover:scale-105 transition-transform duration-500 drop-shadow-sm ml-1">
              IKIGAI
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroIkigai;