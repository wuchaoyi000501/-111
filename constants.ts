import * as THREE from 'three';

export const COLORS = {
  EMERALD_DEEP: '#00241B',
  EMERALD_LITE: '#004d3d',
  GOLD_METALLIC: '#D4AF37',
  GOLD_LIGHT: '#F9E29C',
  RED_VELVET: '#580816',
  WARM_WHITE: '#FFF8E7',
};

export const CONFIG = {
  PARTICLE_COUNT: 4500,
  ORNAMENT_COUNT: 180,
  TREE_HEIGHT: 14,
  TREE_RADIUS: 5.5,
  SCATTER_RADIUS: 25,
  ANIMATION_SPEED: 1.5, // Seconds for transition
};

export const THEME_COLORS = {
  primary: new THREE.Color(COLORS.EMERALD_DEEP),
  secondary: new THREE.Color(COLORS.GOLD_METALLIC),
  highlight: new THREE.Color(COLORS.GOLD_LIGHT),
};
