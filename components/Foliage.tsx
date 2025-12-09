import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, THEME_COLORS } from '../constants';
import { getConePoint, getRandomSpherePoint } from '../utils/geometry';

// Custom Shader for performance and visual effects
const FoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uColorBase: { value: THEME_COLORS.primary },
    uColorTip: { value: THEME_COLORS.secondary },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying float vAlpha;
    varying vec3 vColor;

    // Cubic easing out
    float easeOutCubic(float x) {
      return 1.0 - pow(1.0 - x, 3.0);
    }

    void main() {
      float t = easeOutCubic(uProgress);
      
      // Interpolate position
      vec3 pos = mix(aScatterPos, aTreePos, t);
      
      // Add "breathing" / drift effect
      float drift = sin(uTime * 0.5 + aRandom * 10.0) * 0.2;
      
      // Scatte state has more chaotic drift
      float scatterDrift = (1.0 - t) * sin(uTime + aRandom * 20.0) * 0.5;
      
      pos.x += drift + scatterDrift;
      pos.y += drift * 0.5;
      pos.z += drift + scatterDrift;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      gl_PointSize = (4.0 * (1.0 + t * 0.5)) * (10.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;

      // Pass randomness to frag for twinkling
      vAlpha = 0.6 + 0.4 * sin(uTime * 2.0 + aRandom * 20.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColorBase;
    uniform vec3 uColorTip;
    varying float vAlpha;
    varying vec3 vColor;

    void main() {
      // Circular particle
      vec2 center = 2.0 * gl_PointCoord - 1.0;
      float dist = dot(center, center);
      if (dist > 1.0) discard;

      // Soft edge
      float alpha = (1.0 - dist) * vAlpha;
      
      // Gradient color (Gold core, Green edge)
      vec3 color = mix(uColorBase, uColorTip, (1.0 - dist) * 0.4);

      gl_FragColor = vec4(color, alpha);
    }
  `
};

interface FoliageProps {
  progress: number;
}

export const Foliage: React.FC<FoliageProps> = ({ progress }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positions, scatterPositions, randoms } = useMemo(() => {
    const count = CONFIG.PARTICLE_COUNT;
    const pos = new Float32Array(count * 3);
    const scat = new Float32Array(count * 3);
    const rnd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const treeP = getConePoint(CONFIG.TREE_HEIGHT, CONFIG.TREE_RADIUS);
      const scatP = getRandomSpherePoint(CONFIG.SCATTER_RADIUS);

      pos.set(treeP, i * 3);
      scat.set(scatP, i * 3);
      rnd[i] = Math.random();
    }
    
    return { positions: pos, scatterPositions: scat, randoms: rnd };
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      // Smoothly lerp the uniform value for shader logic (though prop is already lerped in parent)
      // Doing direct assignment here for shader precision
      shaderRef.current.uniforms.uProgress.value = progress;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-aTreePos"
          count={CONFIG.PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={CONFIG.PARTICLE_COUNT}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={CONFIG.PARTICLE_COUNT}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-position" // Dummy position for frustum culling validation
          count={CONFIG.PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        args={[FoliageShaderMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
