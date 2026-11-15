import { Grid, PaylineDef, SymbolDef, SymbolId } from './types';

export const STARTING_BALANCE = 2500;
export const PROGRESSIVE_SEED = 10000;
export const PROGRESSIVE_CONTRIBUTION_RATE = 0.02;
export const DEFAULT_ACTIVE_LINES = 20;
export const DEFAULT_BET_PER_LINE = 1.0;
export const BET_PER_LINE_OPTIONS = [0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 25.0] as const;
export const LINE_COUNT_OPTIONS = [1, 5, 10, 15, 20] as const;
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
];

/**
 * Balanced 5-reel strip weights tuned for lively hit frequency (~30-35% hit rate)
 * and ~95% theoretical RTP with exciting Wilds and 3x Free Spins.
 */
export const REEL_STRIPS: readonly SymbolId[][] = [
  // Reel 1
  [
    'CANDY', 'STOCKING', 'SNOWMAN', 'GIFT', 'CANDY', 'REINDEER', 'BELL', 'STOCKING',
    'SNOWMAN', 'CANDY', 'TREE', 'GIFT', 'WILD', 'STOCKING', 'REINDEER', 'SNOWMAN',
    'CANDY', 'SCATTER', 'BELL', 'GIFT', 'STOCKING', 'SNOWMAN', 'REINDEER', 'TREE',
    'CANDY', 'GIFT', 'STOCKING', 'SNOWMAN', 'BELL', 'REINDEER', 'CANDY', 'SCATTER',
  ],
  // Reel 2
  [
    'STOCKING', 'CANDY', 'GIFT', 'SNOWMAN', 'WILD', 'REINDEER', 'STOCKING', 'BELL',
    'CANDY', 'TREE', 'SNOWMAN', 'GIFT', 'SCATTER', 'CANDY', 'STOCKING', 'REINDEER',
    'BELL', 'SNOWMAN', 'WILD', 'CANDY', 'GIFT', 'TREE', 'STOCKING', 'SNOWMAN',
    'REINDEER', 'CANDY', 'GIFT', 'BELL', 'SCATTER', 'STOCKING', 'SNOWMAN', 'REINDEER',
  ],
  // Reel 3
  [
    'SNOWMAN', 'CANDY', 'REINDEER', 'GIFT', 'STOCKING', 'SCATTER', 'BELL', 'CANDY',
    'WILD', 'SNOWMAN', 'TREE', 'STOCKING', 'GIFT', 'CANDY', 'REINDEER', 'BELL',
    'SNOWMAN', 'STOCKING', 'GIFT', 'WILD', 'CANDY', 'TREE', 'REINDEER', 'SNOWMAN',
    'SCATTER', 'STOCKING', 'CANDY', 'BELL', 'GIFT', 'REINDEER', 'SNOWMAN', 'STOCKING',
  ],
  // Reel 4
  [
    'BELL', 'STOCKING', 'CANDY', 'REINDEER', 'SNOWMAN', 'GIFT', 'WILD', 'CANDY',
    'TREE', 'STOCKING', 'SNOWMAN', 'REINDEER', 'CANDY', 'BELL', 'SCATTER', 'GIFT',
    'STOCKING', 'SNOWMAN', 'CANDY', 'REINDEER', 'BELL', 'GIFT', 'WILD', 'TREE',
    'STOCKING', 'CANDY', 'SNOWMAN', 'REINDEER', 'GIFT', 'SCATTER', 'CANDY', 'STOCKING',
  ],
  // Reel 5
  [
    'CANDY', 'SNOWMAN', 'BELL', 'STOCKING', 'REINDEER', 'GIFT', 'CANDY', 'TREE',
    'WILD', 'STOCKING', 'SNOWMAN', 'CANDY', 'REINDEER', 'BELL', 'GIFT', 'SCATTER',
    'STOCKING', 'CANDY', 'SNOWMAN', 'TREE', 'REINDEER', 'GIFT', 'BELL', 'CANDY',
    'STOCKING', 'SNOWMAN', 'WILD', 'REINDEER', 'SCATTER', 'CANDY', 'GIFT', 'BELL',
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
