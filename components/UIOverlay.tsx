import React from 'react';
import { TreeMode } from '../types';

interface UIOverlayProps {
  mode: TreeMode;
  setMode: (mode: TreeMode) => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ mode, setMode }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* Header */}
      <div className="flex flex-col items-center opacity-90">
        <h1 className="text-4xl md:text-6xl text-[#D4AF37] font-serif-display tracking-widest text-center drop-shadow-lg">
          ARIX
        </h1>
        <div className="h-[1px] w-24 bg-[#D4AF37] my-4 shadow-[0_0_10px_#D4AF37]"></div>
        <h2 className="text-white/80 font-cinzel text-sm tracking-[0.3em] uppercase">
          Signature Collection
        </h2>
      </div>

      {/* Controls */}
      <div className="flex justify-center pb-8 pointer-events-auto">
        <button
          onClick={() => setMode(mode === TreeMode.SCATTERED ? TreeMode.TREE_SHAPE : TreeMode.SCATTERED)}
          className={`
            group relative px-8 py-4 bg-black/40 backdrop-blur-md 
            border border-[#D4AF37]/30 transition-all duration-700 ease-out
            hover:bg-[#00241B]/80 hover:border-[#D4AF37] hover:scale-105
            overflow-hidden
          `}
        >
          {/* Inner Glow Container */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          <span className="relative z-10 font-cinzel text-[#F9E29C] tracking-widest text-lg">
            {mode === TreeMode.SCATTERED ? 'ASSEMBLE' : 'SCATTER'}
          </span>
          
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
      
      {/* Footer / Credits */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
         <p className="text-[#D4AF37]/40 font-cinzel text-[10px] tracking-widest">
            INTERACTIVE EXPERIENCE
         </p>
      </div>
    </div>
  );
};
