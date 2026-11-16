import { Grid, PaylineDef, SymbolDef, SymbolId } from './types';

export const STARTING_BALANCE = 2500;
export const PROGRESSIVE_SEED = 10000;
export const PROGRESSIVE_CONTRIBUTION_RATE = 0.02;
export const DEFAULT_ACTIVE_LINES = 50;
export const DEFAULT_BET_PER_LINE = 1.0;
export const BET_PER_LINE_OPTIONS = [0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 25.0] as const;
export const LINE_COUNT_OPTIONS = [1, 10, 20, 30, 40, 50] as const;
export const FREE_SPIN_MULTIPLIER = 3;

export const FREE_SPINS_BY_SCATTERS: Record<number, number> = {
  3: 10,
  4: 15,
  5: 25,
};

export const SCATTER_TOTAL_BET_MULTIPLIERS: Record<number, number> = {
  3: 5,
  4: 20,
  5: 100,
};

export const SYMBOLS: Record<SymbolId, SymbolDef> = {
  WILD: {
    id: 'WILD',
    name: 'Père Noël',
    shortLabel: 'WILD',
    emoji: '🎅',
    isWild: true,
    payouts: { 3: 50, 4: 200, 5: 1000 },
    accentColor: '#C81E1E',
  },
  SCATTER: {
    id: 'SCATTER',
    name: 'Étoile Polaire',
    shortLabel: 'SCATTER',
    emoji: '🌟',
    isScatter: true,
    payouts: { 3: 5, 4: 20, 5: 100 },
    accentColor: '#EAB308',
  },
  TREE: {
    id: 'TREE',
    name: 'Sapin de Noël',
    shortLabel: 'Sapin',
    emoji: '🎄',
    payouts: { 3: 15, 4: 60, 5: 250 },
    accentColor: '#15803D',
  },
  BELL: {
    id: 'BELL',
    name: "Cloche d'Or",
    shortLabel: 'Cloche',
    emoji: '🔔',
    payouts: { 3: 12, 4: 50, 5: 200 },
    accentColor: '#D97706',
  },
  GIFT: {
    id: 'GIFT',
    name: 'Cadeau Magique',
    shortLabel: 'Cadeau',
    emoji: '🎁',
    payouts: { 3: 10, 4: 40, 5: 150 },
    accentColor: '#DC2626',
  },
  REINDEER: {
    id: 'REINDEER',
    name: 'Renne Polaire',
    shortLabel: 'Renne',
    emoji: '🦌',
    payouts: { 3: 8, 4: 30, 5: 100 },
    accentColor: '#92400E',
  },
  SNOWMAN: {
    id: 'SNOWMAN',
    name: 'Bonhomme de Neige',
    shortLabel: 'Neige',
    emoji: '⛄',
    payouts: { 3: 6, 4: 25, 5: 80 },
    accentColor: '#0284C7',
  },
  STOCKING: {
    id: 'STOCKING',
    name: 'Chaussette',
    shortLabel: 'Chaussette',
    emoji: '🧦',
    payouts: { 3: 5, 4: 20, 5: 60 },
    accentColor: '#B91C1C',
  },
  CANDY: {
    id: 'CANDY',
    name: "Sucre d'Orge",
    shortLabel: 'Sucre',
    emoji: '🍬',
    payouts: { 3: 4, 4: 15, 5: 50 },
    accentColor: '#E11D48',
  },
};

export const SYMBOL_ORDER: SymbolId[] = [
  'WILD',
  'SCATTER',
  'TREE',
  'BELL',
  'GIFT',
  'REINDEER',
  'SNOWMAN',
  'STOCKING',
  'CANDY',
];

export const PAYLINES: PaylineDef[] = [
  { id: 1, name: 'Ligne 1 (Milieu)', pattern: [1, 1, 1, 1, 1], color: '#F59E0B' },
  { id: 2, name: 'Ligne 2 (Haut)', pattern: [0, 0, 0, 0, 0], color: '#EF4444' },
  { id: 3, name: 'Ligne 3 (Bas)', pattern: [2, 2, 2, 2, 2], color: '#10B981' },
  { id: 4, name: 'Ligne 4 (V)', pattern: [0, 1, 2, 1, 0], color: '#38BDF8' },
  { id: 5, name: 'Ligne 5 (V Inversé)', pattern: [2, 1, 0, 1, 2], color: '#A855F7' },
  { id: 6, name: 'Ligne 6 (Plateau Haut)', pattern: [0, 0, 1, 0, 0], color: '#F97316' },
  { id: 7, name: 'Ligne 7 (Plateau Bas)', pattern: [2, 2, 1, 2, 2], color: '#14B8A6' },
  { id: 8, name: 'Ligne 8 (Cuvette)', pattern: [1, 2, 2, 2, 1], color: '#EC4899' },
  { id: 9, name: 'Ligne 9 (Dôme)', pattern: [1, 0, 0, 0, 1], color: '#84CC16' },
  { id: 10, name: 'Ligne 10 (Diagonale Desc.)', pattern: [0, 1, 1, 1, 2], color: '#FBBF24' },
  { id: 11, name: 'Ligne 11 (Diagonale Mont.)', pattern: [2, 1, 1, 1, 0], color: '#34D399' },
  { id: 12, name: 'Ligne 12 (Crête)', pattern: [1, 0, 1, 0, 1], color: '#FB7185' },
  { id: 13, name: 'Ligne 13 (Vallée)', pattern: [1, 2, 1, 2, 1], color: '#60A5FA' },
  { id: 14, name: 'Ligne 14 (Arche Haut)', pattern: [0, 1, 0, 1, 0], color: '#F472B6' },
  { id: 15, name: 'Ligne 15 (Arche Bas)', pattern: [2, 1, 2, 1, 2], color: '#2DD4BF' },
  { id: 16, name: 'Ligne 16 (Zigzag Haut)', pattern: [1, 1, 0, 1, 1], color: '#FACC15' },
  { id: 17, name: 'Ligne 17 (Zigzag Bas)', pattern: [1, 1, 2, 1, 1], color: '#4ADE80' },
  { id: 18, name: 'Ligne 18 (Escalier Desc.)', pattern: [0, 0, 1, 2, 2], color: '#FB923C' },
  { id: 19, name: 'Ligne 19 (Escalier Mont.)', pattern: [2, 2, 1, 0, 0], color: '#C084FC' },
  { id: 20, name: 'Ligne 20 (Éclair)', pattern: [0, 2, 0, 2, 0], color: '#38BDF8' },
  { id: 21, name: 'Ligne 21 (Éclair Inversé)', pattern: [2, 0, 2, 0, 2], color: '#F43F5E' },
  { id: 22, name: 'Ligne 22 (Puits)', pattern: [0, 0, 2, 0, 0], color: '#06B6D4' },
  { id: 23, name: 'Ligne 23 (Pic)', pattern: [2, 2, 0, 2, 2], color: '#A3E635' },
  { id: 24, name: 'Ligne 24 (Pente Droite)', pattern: [1, 0, 0, 1, 2], color: '#FB923C' },
  { id: 25, name: 'Ligne 25 (Montée Droite)', pattern: [1, 2, 2, 1, 0], color: '#818CF8' },
  { id: 26, name: 'Ligne 26 (Glissade)', pattern: [0, 1, 2, 2, 2], color: '#F472B6' },
  { id: 27, name: 'Ligne 27 (Ascension)', pattern: [2, 1, 0, 0, 0], color: '#2DD4BF' },
  { id: 28, name: 'Ligne 28 (Palier Haut)', pattern: [0, 0, 1, 1, 1], color: '#FBBF24' },
  { id: 29, name: 'Ligne 29 (Palier Bas)', pattern: [2, 2, 1, 1, 1], color: '#34D399' },
  { id: 30, name: 'Ligne 30 (Épaule Haute)', pattern: [1, 1, 1, 0, 0], color: '#F87171' },
  { id: 31, name: 'Ligne 31 (Épaule Basse)', pattern: [1, 1, 1, 2, 2], color: '#60A5FA' },
  { id: 32, name: 'Ligne 32 (Berceau Haut)', pattern: [0, 1, 1, 0, 0], color: '#C084FC' },
  { id: 33, name: 'Ligne 33 (Berceau Bas)', pattern: [2, 1, 1, 2, 2], color: '#4ADE80' },
  { id: 34, name: 'Ligne 34 (Papillon Haut)', pattern: [1, 0, 2, 0, 1], color: '#FACC15' },
  { id: 35, name: 'Ligne 35 (Papillon Bas)', pattern: [1, 2, 0, 2, 1], color: '#38BDF8' },
  { id: 36, name: 'Ligne 36 (Trident Bas)', pattern: [0, 2, 1, 2, 0], color: '#FB7185' },
  { id: 37, name: 'Ligne 37 (Trident Haut)', pattern: [2, 0, 1, 0, 2], color: '#22D3EE' },
  { id: 38, name: 'Ligne 38 (Cascade Desc.)', pattern: [0, 1, 2, 0, 1], color: '#A855F7' },
  { id: 39, name: 'Ligne 39 (Cascade Mont.)', pattern: [2, 1, 0, 2, 1], color: '#10B981' },
  { id: 40, name: 'Ligne 40 (Onde S)', pattern: [1, 0, 1, 2, 1], color: '#F97316' },
  { id: 41, name: 'Ligne 41 (Onde Z)', pattern: [1, 2, 1, 0, 1], color: '#EC4899' },
  { id: 42, name: 'Ligne 42 (Grand U)', pattern: [0, 2, 2, 2, 0], color: '#14B8A6' },
  { id: 43, name: 'Ligne 43 (Grand N)', pattern: [2, 0, 0, 0, 2], color: '#EAB308' },
  { id: 44, name: 'Ligne 44 (Couronne)', pattern: [0, 1, 0, 2, 0], color: '#EF4444' },
  { id: 45, name: 'Ligne 45 (Guirlande)', pattern: [2, 1, 2, 0, 2], color: '#84CC16' },
  { id: 46, name: 'Ligne 46 (Saut Haut)', pattern: [1, 0, 0, 2, 1], color: '#3B82F6' },
  { id: 47, name: 'Ligne 47 (Saut Bas)', pattern: [1, 2, 2, 0, 1], color: '#F59E0B' },
  { id: 48, name: 'Ligne 48 (Pont Bas)', pattern: [0, 0, 2, 2, 0], color: '#D946EF' },
  { id: 49, name: 'Ligne 49 (Pont Haut)', pattern: [2, 2, 0, 0, 2], color: '#22C55E' },
  { id: 50, name: 'Ligne 50 (Étoile Royale)', pattern: [0, 2, 1, 0, 2], color: '#FDE047' },
];

/**
 * Balanced 5-reel strip weights tuned for 50 paylines (~91-95% theoretical RTP)
 * with lively hit frequency and 3x North Star Free Spins.
 */
export const REEL_STRIPS: readonly SymbolId[][] = [
  // Reel 1
  [
    'CANDY', 'STOCKING', 'SNOWMAN', 'GIFT', 'REINDEER', 'CANDY', 'BELL', 'STOCKING',
    'SNOWMAN', 'TREE', 'CANDY', 'GIFT', 'WILD', 'STOCKING', 'SNOWMAN', 'CANDY',
    'SCATTER', 'REINDEER', 'BELL', 'STOCKING', 'SNOWMAN', 'CANDY', 'GIFT', 'TREE',
    'REINDEER', 'CANDY', 'STOCKING', 'WILD', 'SNOWMAN', 'GIFT', 'BELL', 'CANDY',
  ],
  // Reel 2
  [
    'REINDEER', 'BELL', 'GIFT', 'CANDY', 'SNOWMAN', 'REINDEER', 'STOCKING', 'BELL',
    'GIFT', 'TREE', 'CANDY', 'REINDEER', 'WILD', 'SNOWMAN', 'STOCKING', 'GIFT',
    'CANDY', 'SCATTER', 'BELL', 'REINDEER', 'SNOWMAN', 'STOCKING', 'GIFT', 'TREE',
    'CANDY', 'BELL', 'REINDEER', 'WILD', 'SNOWMAN', 'STOCKING', 'GIFT', 'CANDY',
  ],
  // Reel 3
  [
    'CANDY', 'STOCKING', 'SNOWMAN', 'GIFT', 'BELL', 'REINDEER', 'TREE', 'CANDY',
    'WILD', 'STOCKING', 'SNOWMAN', 'GIFT', 'REINDEER', 'CANDY', 'BELL', 'STOCKING',
    'SNOWMAN', 'SCATTER', 'GIFT', 'REINDEER', 'TREE', 'CANDY', 'STOCKING', 'SNOWMAN',
    'BELL', 'GIFT', 'REINDEER', 'CANDY', 'STOCKING', 'SNOWMAN', 'WILD', 'TREE',
  ],
  // Reel 4
  [
    'BELL', 'CANDY', 'SNOWMAN', 'STOCKING', 'GIFT', 'REINDEER', 'TREE', 'CANDY',
    'WILD', 'SNOWMAN', 'BELL', 'STOCKING', 'GIFT', 'REINDEER', 'CANDY', 'SNOWMAN',
    'STOCKING', 'SCATTER', 'BELL', 'GIFT', 'REINDEER', 'TREE', 'CANDY', 'SNOWMAN',
    'STOCKING', 'BELL', 'GIFT', 'WILD', 'REINDEER', 'CANDY', 'SNOWMAN', 'STOCKING',
  ],
  // Reel 5
  [
    'CANDY', 'SNOWMAN', 'BELL', 'STOCKING', 'REINDEER', 'GIFT', 'CANDY', 'TREE',
    'WILD', 'STOCKING', 'SNOWMAN', 'CANDY', 'REINDEER', 'BELL', 'GIFT', 'SCATTER',
    'STOCKING', 'CANDY', 'SNOWMAN', 'TREE', 'REINDEER', 'GIFT', 'BELL', 'CANDY',
    'STOCKING', 'SNOWMAN', 'WILD', 'REINDEER', 'CANDY', 'GIFT', 'BELL', 'STOCKING',
  ],
];

/**
 * High-variance strips ("Rare Big Wins") tuned for 50 paylines (~95% RTP):
 * fewer hits paired with stacked premiums and boosted 4/5-match & Scatter payouts.
 */
export const REEL_STRIPS_RARE: readonly SymbolId[][] = [
  // Reel 1 (heavy on SNOWMAN / REINDEER, moderate TREE / BELL / GIFT)
  [
    'TREE', 'TREE', 'SNOWMAN', 'REINDEER', 'SNOWMAN', 'REINDEER', 'BELL', 'SNOWMAN',
    'SCATTER', 'REINDEER', 'SNOWMAN', 'GIFT', 'REINDEER', 'SNOWMAN', 'TREE', 'REINDEER',
    'WILD', 'SNOWMAN', 'REINDEER', 'BELL', 'SNOWMAN', 'REINDEER', 'STOCKING', 'CANDY',
    'TREE', 'SNOWMAN', 'REINDEER', 'GIFT', 'SNOWMAN', 'REINDEER', 'BELL', 'SNOWMAN',
  ],
  // Reel 2 (heavy on CANDY / STOCKING, minimal SNOWMAN / REINDEER)
  [
    'CANDY', 'STOCKING', 'CANDY', 'STOCKING', 'BELL', 'TREE', 'TREE', 'CANDY',
    'SCATTER', 'STOCKING', 'CANDY', 'STOCKING', 'WILD', 'CANDY', 'GIFT', 'STOCKING',
    'CANDY', 'STOCKING', 'CANDY', 'GIFT', 'STOCKING', 'CANDY', 'BELL', 'STOCKING',
    'CANDY', 'STOCKING', 'TREE', 'CANDY', 'STOCKING', 'CANDY', 'SNOWMAN', 'REINDEER',
  ],
  // Reel 3
  [
    'BELL', 'BELL', 'TREE', 'TREE', 'WILD', 'GIFT', 'CANDY', 'STOCKING',
    'SNOWMAN', 'REINDEER', 'SCATTER', 'CANDY', 'STOCKING', 'SNOWMAN', 'REINDEER', 'BELL',
    'TREE', 'GIFT', 'CANDY', 'STOCKING', 'SNOWMAN', 'REINDEER', 'TREE', 'BELL',
    'GIFT', 'CANDY', 'STOCKING', 'SNOWMAN', 'REINDEER', 'CANDY', 'STOCKING', 'REINDEER',
  ],
  // Reel 4
  [
    'TREE', 'TREE', 'BELL', 'GIFT', 'WILD', 'REINDEER', 'SNOWMAN', 'CANDY',
    'STOCKING', 'SCATTER', 'TREE', 'BELL', 'GIFT', 'REINDEER', 'SNOWMAN', 'CANDY',
    'STOCKING', 'TREE', 'BELL', 'GIFT', 'WILD', 'REINDEER', 'SNOWMAN', 'CANDY',
    'STOCKING', 'TREE', 'BELL', 'GIFT', 'REINDEER', 'SNOWMAN', 'CANDY', 'STOCKING',
  ],
  // Reel 5
  [
    'WILD', 'TREE', 'TREE', 'BELL', 'GIFT', 'SCATTER', 'REINDEER', 'SNOWMAN',
    'CANDY', 'STOCKING', 'TREE', 'BELL', 'GIFT', 'REINDEER', 'SNOWMAN', 'CANDY',
    'STOCKING', 'TREE', 'BELL', 'GIFT', 'WILD', 'SCATTER', 'REINDEER', 'SNOWMAN',
    'CANDY', 'STOCKING', 'TREE', 'BELL', 'GIFT', 'REINDEER', 'SNOWMAN', 'CANDY',
  ],
];

export const SHOWCASE_GRID: Grid = [
  ['GIFT', 'WILD', 'GIFT', 'BELL', 'STOCKING'],
  ['SNOWMAN', 'CANDY', 'SCATTER', 'REINDEER', 'CANDY'],
  ['STOCKING', 'TREE', 'REINDEER', 'SNOWMAN', 'BELL'],
];

export function formatEuro(amount: number): string {
  const fixed = amount.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const spacedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${spacedInt}.${decPart} €`;
}
