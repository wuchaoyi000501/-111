import * as THREE from 'three';

export enum TreeMode {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface DualPosition {
  treePos: [number, number, number];
  scatterPos: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  type: 'box' | 'sphere' | 'star';
}

export interface Uniforms {
  uTime: { value: number };
  uProgress: { value: number };
  uColorPrimary: { value: THREE.Color };
  uColorSecondary: { value: THREE.Color };
}