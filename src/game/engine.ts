import {
  BET_PER_LINE_OPTIONS,
  DEFAULT_ACTIVE_LINES,
  DEFAULT_BET_PER_LINE,
  FREE_SPIN_MULTIPLIER,
  FREE_SPINS_BY_SCATTERS,
  PAYLINES,
  PROGRESSIVE_CONTRIBUTION_RATE,
  PROGRESSIVE_SEED,
  REEL_STRIPS,
  SCATTER_TOTAL_BET_MULTIPLIERS,
  STARTING_BALANCE,
  SYMBOLS,
} from './constants';
import { Grid, PaylineDef, SlotMachineState, SpinResult, SymbolId, WinningLine } from './types';

export function createInitialSlotState(
  initialJackpot: number = PROGRESSIVE_SEED,
): SlotMachineState {
  return {
    balance: STARTING_BALANCE,
    progressiveJackpot: Math.max(PROGRESSIVE_SEED, roundCurrency(initialJackpot)),
    activeLines: DEFAULT_ACTIVE_LINES,
    betPerLine: DEFAULT_BET_PER_LINE,
    freeSpinsRemaining: 0,
    freeSpinsTotalWin: 0,
    lastResult: null,
    stats: {
      totalSpins: 0,
      totalWagered: 0,
      totalWon: 0,
      biggestWin: 0,
      freeSpinsTriggered: 0,
      peakBalance: STARTING_BALANCE,
    },
  };
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function spinReels(rng: () => number = Math.random): Grid {
  const cols: SymbolId[][] = [];

  for (let col = 0; col < 5; col++) {
    const strip = REEL_STRIPS[col];
    const startIdx = Math.floor(rng() * strip.length);
    const colSymbols: SymbolId[] = [
      strip[startIdx % strip.length],
      strip[(startIdx + 1) % strip.length],
      strip[(startIdx + 2) % strip.length],
    ];
    cols.push(colSymbols);
  }

  return [
    [cols[0][0], cols[1][0], cols[2][0], cols[3][0], cols[4][0]],
    [cols[0][1], cols[1][1], cols[2][1], cols[3][1], cols[4][1]],
    [cols[0][2], cols[1][2], cols[2][2], cols[3][2], cols[4][2]],
  ];
}

function evaluatePayline(
  grid: Grid,
  payline: PaylineDef,
  betPerLine: number,
  winMultiplier: number,
): WinningLine | null {
  const lineSymbols: SymbolId[] = [
    grid[payline.pattern[0]][0],
    grid[payline.pattern[1]][1],
    grid[payline.pattern[2]][2],
    grid[payline.pattern[3]][3],
    grid[payline.pattern[4]][4],
  ];

  // Scatters never pay as standard left-to-right line symbols
  if (lineSymbols[0] === 'SCATTER') {
    return null;
  }

  // 1. Check pure WILD-only win from reel 0
  let wildOnlyCount = 0;
  for (let col = 0; col < 5; col++) {
    if (lineSymbols[col] === 'WILD') {
      wildOnlyCount++;
    } else {
      break;
    }
  }

  const wildOnlyMultiplier =
    wildOnlyCount >= 3 ? SYMBOLS.WILD.payouts[wildOnlyCount as 3 | 4 | 5] : 0;

  // 2. Determine target regular symbol (first non-WILD symbol on the line)
  let targetSymbol: SymbolId | null = null;
  for (let col = 0; col < 5; col++) {
    if (lineSymbols[col] !== 'WILD') {
      targetSymbol = lineSymbols[col];
      break;
    }
  }

  let substitutedCount = 0;
  let usedWild = false;
  let substitutedMultiplier = 0;

  if (targetSymbol && targetSymbol !== 'SCATTER') {
    for (let col = 0; col < 5; col++) {
      const sym = lineSymbols[col];
      if (sym === targetSymbol || sym === 'WILD') {
        substitutedCount++;
        if (sym === 'WILD') usedWild = true;
      } else {
        break;
      }
    }
    if (substitutedCount >= 3) {
      substitutedMultiplier = SYMBOLS[targetSymbol].payouts[substitutedCount as 3 | 4 | 5];
    }
  }

  // Choose the highest paying interpretation for this payline
  let chosenSymbol: SymbolId;
  let matchCount: 3 | 4 | 5;
  let baseMultiplier: number;
  let finalUsedWild: boolean;

  if (wildOnlyMultiplier >= substitutedMultiplier && wildOnlyCount >= 3) {
    chosenSymbol = 'WILD';
    matchCount = wildOnlyCount as 3 | 4 | 5;
    baseMultiplier = wildOnlyMultiplier;
    finalUsedWild = false;
  } else if (targetSymbol && substitutedMultiplier > 0 && substitutedCount >= 3) {
    chosenSymbol = targetSymbol;
    matchCount = substitutedCount as 3 | 4 | 5;
    baseMultiplier = substitutedMultiplier;
    finalUsedWild = usedWild;
  } else {
    return null;
  }

  const positions: Array<[number, number]> = [];
  for (let col = 0; col < matchCount; col++) {
    positions.push([payline.pattern[col], col]);
  }

  const payout = roundCurrency(betPerLine * baseMultiplier * winMultiplier);

  return {
    lineId: payline.id,
    lineName: payline.name,
    pattern: payline.pattern,
    symbolId: chosenSymbol,
    matchCount,
    positions,
    baseMultiplier,
    appliedMultiplier: winMultiplier,
    payout,
    usedWild: finalUsedWild,
    color: payline.color,
  };
}

export function evaluateGrid(
  grid: Grid,
  activeLines: number,
  betPerLine: number,
  wasFreeSpin = false,
): SpinResult {
  const clampedLines = Math.max(1, Math.min(PAYLINES.length, activeLines));
  const totalBet = roundCurrency(clampedLines * betPerLine);
  const winMultiplier = wasFreeSpin ? FREE_SPIN_MULTIPLIER : 1;

  const winningLines: WinningLine[] = [];
  for (let i = 0; i < clampedLines; i++) {
    const win = evaluatePayline(grid, PAYLINES[i], betPerLine, winMultiplier);
    if (win) {
      winningLines.push(win);
    }
  }

  const scatterPositions: Array<[number, number]> = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      if (grid[row][col] === 'SCATTER') {
        scatterPositions.push([row, col]);
      }
    }
  }

  const scatterCount = scatterPositions.length;
  const scatterTotalBetMult = SCATTER_TOTAL_BET_MULTIPLIERS[Math.min(5, scatterCount)] ?? 0;
  const scatterPayout = roundCurrency(totalBet * scatterTotalBetMult * winMultiplier);
  const freeSpinsAwarded = FREE_SPINS_BY_SCATTERS[Math.min(5, scatterCount)] ?? 0;

  const lineWinTotal = roundCurrency(
    winningLines.reduce((acc, line) => acc + line.payout, 0),
  );
  const totalWin = roundCurrency(lineWinTotal + scatterPayout);

  return {
    grid,
    winningLines,
    scatterCount,
    scatterPositions,
    scatterPayout,
    lineWinTotal,
    jackpotWon: 0,
    jackpotContribution: 0,
    totalWin,
    freeSpinsAwarded,
    multiplierApplied: winMultiplier,
    wasFreeSpin,
  };
}

export function getMinTotalBet(): number {
  return roundCurrency(BET_PER_LINE_OPTIONS[0] * 1);
}

export function canAffordSpin(state: SlotMachineState): boolean {
  if (state.freeSpinsRemaining > 0) return true;
  const totalBet = roundCurrency(state.activeLines * state.betPerLine);
  return state.balance + 1e-9 >= totalBet;
}

export function isGameOver(state: SlotMachineState): boolean {
  return state.freeSpinsRemaining === 0 && state.balance + 1e-9 < getMinTotalBet();
}

export function computeJackpotContribution(totalBet: number, isFreeSpin: boolean): number {
  if (isFreeSpin) return 0.1;
  return Math.max(0.1, roundCurrency(totalBet * PROGRESSIVE_CONTRIBUTION_RATE));
}

export function hasProgressiveJackpotWin(winningLines: WinningLine[]): boolean {
  return winningLines.some((w) => w.symbolId === 'WILD' && w.matchCount === 5);
}

export function executeSpin(
  state: SlotMachineState,
  gridOverride?: Grid,
  rng: () => number = Math.random,
): { nextState: SlotMachineState; result: SpinResult } {
  const isFree = state.freeSpinsRemaining > 0;
  const totalBet = isFree ? 0 : roundCurrency(state.activeLines * state.betPerLine);

  if (!isFree && state.balance + 1e-9 < totalBet) {
    throw new Error('Insufficient balance for spin');
  }

  const balanceAfterBet = roundCurrency(state.balance - totalBet);
  const jackpotContribution = computeJackpotContribution(totalBet, isFree);
  const potBeforeSpin = roundCurrency(
    Math.max(PROGRESSIVE_SEED, state.progressiveJackpot) + jackpotContribution,
  );

  const grid = gridOverride ?? spinReels(rng);
  const baseResult = evaluateGrid(grid, state.activeLines, state.betPerLine, isFree);

  const wonJackpot = hasProgressiveJackpotWin(baseResult.winningLines);
  const jackpotWon = wonJackpot ? potBeforeSpin : 0;
  const nextProgressiveJackpot = wonJackpot ? PROGRESSIVE_SEED : potBeforeSpin;
  const totalWin = roundCurrency(baseResult.totalWin + jackpotWon);

  const result: SpinResult = {
    ...baseResult,
    jackpotWon,
    jackpotContribution,
    totalWin,
  };

  const newBalance = roundCurrency(balanceAfterBet + result.totalWin);
  const nextFreeSpins =
    (isFree ? state.freeSpinsRemaining - 1 : 0) + result.freeSpinsAwarded;

  const nextFreeSpinsTotalWin = isFree
    ? roundCurrency(state.freeSpinsTotalWin + result.totalWin)
    : result.freeSpinsAwarded > 0
      ? result.totalWin
      : 0;

  const nextState: SlotMachineState = {
    ...state,
    balance: newBalance,
    progressiveJackpot: nextProgressiveJackpot,
    freeSpinsRemaining: nextFreeSpins,
    freeSpinsTotalWin: nextFreeSpinsTotalWin,
    lastResult: result,
    stats: {
      totalSpins: state.stats.totalSpins + 1,
      totalWagered: roundCurrency(state.stats.totalWagered + totalBet),
      totalWon: roundCurrency(state.stats.totalWon + result.totalWin),
      biggestWin: Math.max(state.stats.biggestWin, result.totalWin),
      freeSpinsTriggered:
        state.stats.freeSpinsTriggered + (result.freeSpinsAwarded > 0 ? 1 : 0),
      peakBalance: Math.max(state.stats.peakBalance, newBalance),
    },
  };

  return { nextState, result };
}
