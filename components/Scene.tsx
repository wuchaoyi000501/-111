import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { TreeMode } from '../types';
import { COLORS } from '../constants';
import * as THREE from 'three';

interface SceneProps {
  mode: TreeMode;
  progress: number;
}

// Rig to slowly rotate the entire tree presentation
const Rig = () => {
    const group = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
        }
    });
    return <group ref={group} />;
};

export const Scene: React.FC<SceneProps> = ({ mode, progress }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ 
        antialias: false, 
        toneMapping: THREE.ReinhardToneMapping, 
        toneMappingExposure: 1.5,
        powerPreference: "high-performance"
      }}
      shadows
    >
      <color attach="background" args={['#000504']} />
      
      <PerspectiveCamera makeDefault position={[0, 0, 25]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={40}
        autoRotate={mode === TreeMode.SCATTERED}
        autoRotateSpeed={0.5}
      />

      {/* Lighting System */}
      <ambientLight intensity={0.2} color={COLORS.EMERALD_LITE} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color={COLORS.WARM_WHITE} 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={2} color={COLORS.GOLD_METALLIC} />
      
      {/* Cinematic Fog */}
      <fog attach="fog" args={['#000504', 10, 50]} />

      {/* Content Group */}
      <group position={[0, -4, 0]}>
        <Rig />
        {/* The Star on Top */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh position={[0, 7.5, 0]} scale={progress}>
              <octahedronGeometry args={[0.8, 0]} />
              <meshStandardMaterial 
                color={COLORS.GOLD_LIGHT} 
                emissive={COLORS.GOLD_LIGHT} 
                emissiveIntensity={2}
                toneMapped={false}
              />
            </mesh>
        </Float>

        <Foliage progress={progress} />
        <Ornaments progress={progress} />
        
        {/* Ambient sparkle to enhance luxury feel */}
        <Sparkles 
            count={100} 
            scale={12} 
            size={4} 
            speed={0.4} 
            opacity={0.5} 
            color={COLORS.GOLD_LIGHT}
        />
      </group>

      {/* Post Processing for the "Arix" Look */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
      
      <Environment preset="city" />
    </Canvas>
  );
};
