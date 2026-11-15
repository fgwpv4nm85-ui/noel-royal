export type SymbolId =
  | 'WILD'
  | 'SCATTER'
  | 'TREE'
  | 'BELL'
  | 'GIFT'
  | 'REINDEER'
  | 'SNOWMAN'
  | 'STOCKING'
  | 'CANDY';

export type Grid = [
  [SymbolId, SymbolId, SymbolId, SymbolId, SymbolId],
  [SymbolId, SymbolId, SymbolId, SymbolId, SymbolId],
  [SymbolId, SymbolId, SymbolId, SymbolId, SymbolId],
];

export type RowIndex = 0 | 1 | 2;
export type PaylinePattern = [RowIndex, RowIndex, RowIndex, RowIndex, RowIndex];

export interface SymbolDef {
  id: SymbolId;
  name: string;
  shortLabel: string;
  emoji: string;
  isWild?: boolean;
  isScatter?: boolean;
  /** Payout multipliers per Bet/Line (or Total Bet for Scatter) for 3, 4, 5 matches */
  payouts: {
    3: number;
    4: number;
    5: number;
  };
  accentColor: string;
}

export interface PaylineDef {
  id: number;
  name: string;
  pattern: PaylinePattern;
  color: string;
}

export interface WinningLine {
  lineId: number;
  lineName: string;
  pattern: PaylinePattern;
  symbolId: SymbolId;
  matchCount: 3 | 4 | 5;
  positions: Array<[number, number]>; // [row, col]
  baseMultiplier: number;
  appliedMultiplier: number; // 1 for normal spin, 3 for free spin
  payout: number;
  usedWild: boolean;
  color: string;
}

export interface SpinResult {
  grid: Grid;
  winningLines: WinningLine[];
  scatterCount: number;
  scatterPositions: Array<[number, number]>;
  scatterPayout: number;
  lineWinTotal: number;
  jackpotWon: number;
  jackpotContribution: number;
  totalWin: number;
  freeSpinsAwarded: number;
  multiplierApplied: number;
  wasFreeSpin: boolean;
}

export type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export interface SessionStats {
  totalSpins: number;
  totalWagered: number;
  totalWon: number;
  biggestWin: number;
  freeSpinsTriggered: number;
  peakBalance: number;
}

export interface SlotMachineState {
  balance: number;
  progressiveJackpot: number;
  activeLines: number;
  betPerLine: number;
  freeSpinsRemaining: number;
  freeSpinsTotalWin: number;
  lastResult: SpinResult | null;
  stats: SessionStats;
}
