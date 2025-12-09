import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { getConePoint, getRandomSpherePoint } from '../utils/geometry';
import { DualPosition } from '../types';

interface OrnamentsProps {
  progress: number; // 0 to 1
}

export const Ornaments: React.FC<OrnamentsProps> = ({ progress }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(0.5, 32, 32), []);
  
  // Create gold material with physical properties for high-end look
  const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLORS.GOLD_METALLIC,
    metalness: 0.9,
    roughness: 0.1,
    emissive: new THREE.Color(COLORS.GOLD_LIGHT),
    emissiveIntensity: 0.2,
  }), []);

  const redMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLORS.RED_VELVET,
    metalness: 0.3,
    roughness: 0.6,
  }), []);

  // Generate data for both shapes
  const instances = useMemo(() => {
    const data: DualPosition[] = [];
    
    // Mix of boxes (gifts) and spheres (baubles)
    for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
      const isBox = Math.random() > 0.6;
      const treeP = getConePoint(CONFIG.TREE_HEIGHT - 2, CONFIG.TREE_RADIUS - 0.5);
      
      // Push ornaments slightly "out" to sit on surface
      const dist = Math.sqrt(treeP[0]*treeP[0] + treeP[2]*treeP[2]);
      if(dist > 0) {
          treeP[0] *= 1.2;
          treeP[2] *= 1.2;
      }

      const scatterP = getRandomSpherePoint(CONFIG.SCATTER_RADIUS * 1.2);
      
      data.push({
        treePos: treeP,
        scatterPos: scatterP,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: Math.random() * 0.5 + 0.3,
        color: isBox ? COLORS.RED_VELVET : COLORS.GOLD_METALLIC,
        type: isBox ? 'box' : 'sphere',
      });
    }
    return data;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = progress; // Easing handled in parent or here
    // Custom easing for "heavy" feel
    const ease = 1 - Math.pow(1 - t, 4); 

    instances.forEach((inst, i) => {
      // Interpolate Position
      const cx = THREE.MathUtils.lerp(inst.scatterPos[0], inst.treePos[0], ease);
      const cy = THREE.MathUtils.lerp(inst.scatterPos[1], inst.treePos[1], ease);
      const cz = THREE.MathUtils.lerp(inst.scatterPos[2], inst.treePos[2], ease);

      // Add gentle rotation during float
      const time = state.clock.getElapsedTime();
      const rotX = inst.rotation[0] + time * 0.2 * (1 - ease); // Spin faster when scattered
      const rotY = inst.rotation[1] + time * 0.3;
      
      dummy.position.set(cx, cy, cz);
      dummy.rotation.set(rotX, rotY, inst.rotation[2]);
      
      // Pulsate scale slightly
      const pulse = 1 + Math.sin(time * 2 + i) * 0.05;
      dummy.scale.setScalar(inst.scale * pulse);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      
      // Dynamic coloring logic could go here, but expensive for InstancedMesh without custom shader
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
        {/* We use two InstancedMeshes for different geometries/materials to keep it simple, 
            or a single one with a geometry merger. For visual distinction, let's split. */}
        <InstancedGroup 
            instances={instances.filter(i => i.type === 'box')} 
            geometry={boxGeometry} 
            material={redMaterial} 
            progress={progress}
        />
        <InstancedGroup 
            instances={instances.filter(i => i.type === 'sphere')} 
            geometry={sphereGeometry} 
            material={goldMaterial} 
            progress={progress}
        />
    </group>
  );
};

// Helper component to render specific subsets
const InstancedGroup = ({ instances, geometry, material, progress }: { instances: DualPosition[], geometry: THREE.BufferGeometry, material: THREE.Material, progress: number }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useLayoutEffect(() => {
        if(meshRef.current) {
             instances.forEach((inst, i) => {
                 const color = new THREE.Color(inst.color);
                 meshRef.current!.setColorAt(i, color);
             });
             meshRef.current.instanceColor!.needsUpdate = true;
        }
    }, [instances]);

    useFrame((state) => {
        if (!meshRef.current) return;
        
        // Cubic ease out
        const ease = 1 - Math.pow(1 - progress, 3);
        const time = state.clock.getElapsedTime();

        instances.forEach((inst, i) => {
            const ix = THREE.MathUtils.lerp(inst.scatterPos[0], inst.treePos[0], ease);
            const iy = THREE.MathUtils.lerp(inst.scatterPos[1], inst.treePos[1], ease);
            const iz = THREE.MathUtils.lerp(inst.scatterPos[2], inst.treePos[2], ease);

            // Add floating noise when scattered
            const floatAmp = (1 - ease) * 0.5;
            const fx = Math.sin(time + i) * floatAmp;
            const fy = Math.cos(time * 0.8 + i) * floatAmp;

            dummy.position.set(ix + fx, iy + fy, iz);
            
            // Rotate based on instance prop + time
            dummy.rotation.set(
                inst.rotation[0] + time * 0.1, 
                inst.rotation[1] + time * 0.1, 
                inst.rotation[2]
            );
            
            dummy.scale.setScalar(inst.scale);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh 
            ref={meshRef} 
            args={[geometry, material, instances.length]} 
            castShadow 
            receiveShadow 
        />
    )
}
