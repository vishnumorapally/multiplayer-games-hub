import { LudoColor } from '../types';

export const COLOR_OFFSETS: Record<LudoColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

export const SAFE_GLOBAL_TILES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
