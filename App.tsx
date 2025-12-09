import React, { useState, useEffect, useRef } from 'react';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { TreeMode } from './types';
import { CONFIG } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<TreeMode>(TreeMode.SCATTERED);
  
  // Animation state
  // 0 = Scattered, 1 = Tree Shape
  const [visualProgress, setVisualProgress] = useState(0); 
  const targetProgress = useRef(0);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Handle mode switch
  useEffect(() => {
    targetProgress.current = mode === TreeMode.TREE_SHAPE ? 1 : 0;
  }, [mode]);

  // Smooth animation loop outside of React render cycle for performance
  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setVisualProgress((prev) => {
        const diff = targetProgress.current - prev;
        const speed = CONFIG.ANIMATION_SPEED; 
        
        // Simple linear approach, or ease-out
        const step = delta / speed;
        
        if (Math.abs(diff) < step) return targetProgress.current;
        return prev + Math.sign(diff) * step;
      });

      rafRef.current = requestAnimationFrame(animate);
    };
    
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#000504]">
      <UIOverlay mode={mode} setMode={setMode} />
      <div className="w-full h-full">
        <Scene mode={mode} progress={visualProgress} />
      </div>
      
      {/* Loading Overlay (Simple CSS based) */}
      <div className="absolute inset-0 bg-black pointer-events-none animate-[fadeOut_2s_ease-in_forwards] z-50 flex items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-[#D4AF37] rounded-full animate-spin"></div>
      </div>
      
      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default App;
