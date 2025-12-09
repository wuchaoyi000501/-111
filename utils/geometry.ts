import * as THREE from 'three';
import { CONFIG } from '../constants';

export const getRandomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  const x = r * sinPhi * Math.cos(theta);
  const y = r * sinPhi * Math.sin(theta);
  const z = r * Math.cos(phi);
  return [x, y, z];
};

export const getConePoint = (height: number, radiusBottom: number): [number, number, number] => {
  // Random height along the cone
  const y = (Math.random() - 0.5) * height; 
  // Radius at this height (linear interpolation)
  // Normalized Y from 0 (bottom) to 1 (top) relative to base
  const relY = (y + height / 2) / height; 
  const currentRadius = radiusBottom * (1 - relY);
  
  const angle = Math.random() * Math.PI * 2;
  // Volume distribution correction (sqrt)
  const r = Math.sqrt(Math.random()) * currentRadius;
  
  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  
  return [x, y, z];
};
