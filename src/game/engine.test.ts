import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialSlotState,
  evaluateGrid,
  executeSpin,
  isGameOver,
} from './engine';
import { formatEuro, PAYLINES, SHOWCASE_GRID } from './constants';
import { Grid } from './types';

test('evaluates the exact prompt simulation 5x3 grid accurately', () => {
  // Row 1 (Top): [ 🎁 | 🎅 WILD | 🎁 | 🔔 | 🧦 ]
  // Row 2 (Mid): [ ⛄ | 🍬 | 🌟 SCATTER | 🦌 | 🍬 ]
  // Row 3 (Bot): [ 🧦 | 🎄 | 🦌 | ⛄ | 🔔 ]
  const initialState = createInitialSlotState();
  assert.equal(initialState.balance, 2500);
  assert.equal(initialState.activeLines, 50);
  assert.equal(initialState.betPerLine, 1.0);

  const { nextState, result } = executeSpin(initialState, SHOWCASE_GRID);

  assert.equal(result.winningLines.length, 1);
  assert.equal(result.winningLines[0].lineId, 2);
  assert.equal(result.winningLines[0].lineName, 'Ligne 2 (Haut)');
  assert.deepEqual(result.winningLines[0].pattern, [0, 0, 0, 0, 0]);
  assert.equal(result.winningLines[0].symbolId, 'GIFT');
  assert.equal(result.winningLines[0].matchCount, 3);
  assert.equal(result.winningLines[0].usedWild, true);
  assert.equal(result.winningLines[0].payout, 10.0);

  assert.equal(result.scatterCount, 1);
  assert.equal(result.freeSpinsAwarded, 0);
  assert.equal(result.totalWin, 10.0);
  assert.equal(nextState.balance, 2460.0);
  assert.equal(formatEuro(nextState.balance), '2 460.00 €');
});

test('wild substitution chooses highest paying interpretation and never substitutes for scatter', () => {
  const wildLineGrid: Grid = [
    ['WILD', 'WILD', 'WILD', 'CANDY', 'SNOWMAN'],
    ['SCATTER', 'WILD', 'SCATTER', 'BELL', 'TREE'],
    ['CANDY', 'CANDY', 'CANDY', 'GIFT', 'REINDEER'],
  ];

  const result = evaluateGrid(wildLineGrid, 20, 1.0, false);
  // Line 2 (Top [0,0,0,0,0]) has 3x WILD = 50x = 50.00 (better than 4x CANDY = 15x)
  const line2 = result.winningLines.find((w) => w.lineId === 2);
  assert.ok(line2);
  assert.equal(line2.symbolId, 'WILD');
  assert.equal(line2.matchCount, 3);
  assert.equal(line2.payout, 50.0);

  // Line 1 (Mid [1,1,1,1,1]) starts with SCATTER, so no line win even with WILD on reel 2
  const line1 = result.winningLines.find((w) => w.lineId === 1);
  assert.equal(line1, undefined);

  // Line 3 (Bot [2,2,2,2,2]) has 3x CANDY = 4x = 4.00
  const line3 = result.winningLines.find((w) => w.lineId === 3);
  assert.ok(line3);
  assert.equal(line3.symbolId, 'CANDY');
  assert.equal(line3.payout, 4.0);
});

test('3+ Scatters trigger 3x Free Spins and do not deduct balance during free spins', () => {
  const scatterTriggerGrid: Grid = [
    ['SCATTER', 'CANDY', 'GIFT', 'BELL', 'STOCKING'],
    ['SNOWMAN', 'SCATTER', 'TREE', 'REINDEER', 'CANDY'],
    ['STOCKING', 'TREE', 'SCATTER', 'SNOWMAN', 'BELL'],
  ];

  const state = createInitialSlotState();
  const { nextState, result } = executeSpin(state, scatterTriggerGrid);

  assert.equal(result.scatterCount, 3);
  assert.equal(result.freeSpinsAwarded, 10);
  // 3 Scatters = 5x Total Bet (5 * 50 = 250.00 €)
  assert.equal(result.scatterPayout, 250.0);
  assert.equal(nextState.freeSpinsRemaining, 10);
  // 2500 - 50 + 250 = 2700
  assert.equal(nextState.balance, 2700);

  // Now run a Free Spin with Showcase Grid -> Ligne 2 Gift 3x gets 3x multiplier = 30.00 €!
  const freeSpinOutcome = executeSpin(nextState, SHOWCASE_GRID);
  assert.equal(freeSpinOutcome.result.wasFreeSpin, true);
  assert.equal(freeSpinOutcome.result.multiplierApplied, 3);
  assert.equal(freeSpinOutcome.result.totalWin, 30.0);
  assert.equal(freeSpinOutcome.nextState.freeSpinsRemaining, 9);
  assert.equal(freeSpinOutcome.nextState.balance, 2730); // 2700 - 0 + 30
});

test('activeLines limits which paylines are evaluated', () => {
  // Showcase grid only wins on Line 2 (Top [0,0,0,0,0])
  const oneLineResult = evaluateGrid(SHOWCASE_GRID, 1, 1.0, false);
  assert.equal(oneLineResult.winningLines.length, 0);

  const twoLineResult = evaluateGrid(SHOWCASE_GRID, 2, 1.0, false);
  assert.equal(twoLineResult.winningLines.length, 1);
  assert.equal(twoLineResult.winningLines[0].lineId, 2);
});

test('max bet spin of 1250.00 EUR and gameover detection work properly', () => {
  assert.equal(PAYLINES.length, 50);
  const uniquePatterns = new Set(PAYLINES.map((p) => p.pattern.join(',')));
  assert.equal(uniquePatterns.size, 50);

  const state = {
    ...createInitialSlotState(),
    activeLines: 50,
    betPerLine: 25.0,
    balance: 1250.0,
  };
  const losingGrid: Grid = [
    ['CANDY', 'SNOWMAN', 'STOCKING', 'BELL', 'TREE'],
    ['TREE', 'BELL', 'REINDEER', 'CANDY', 'SNOWMAN'],
    ['STOCKING', 'GIFT', 'SNOWMAN', 'TREE', 'REINDEER'],
  ];

  const { nextState, result } = executeSpin(state, losingGrid);
  assert.equal(result.totalWin, 0);
  assert.equal(nextState.balance, 0);
  assert.equal(isGameOver(nextState), true);
});

test('progressive jackpot increments on every spin and resets to seed when 5x WILD hits', () => {
  const initial = createInitialSlotState(10000);
  assert.equal(initial.progressiveJackpot, 10000);

  // Regular 50.00 EUR spin (50 lines * 1.00 EUR) contributes 2% = 1.00 EUR
  const spin1 = executeSpin(initial, SHOWCASE_GRID);
  assert.equal(spin1.result.jackpotContribution, 1.0);
  assert.equal(spin1.result.jackpotWon, 0);
  assert.equal(spin1.nextState.progressiveJackpot, 10001.0);

  // 5x WILD across Row 0 (Ligne 2 Haut [0,0,0,0,0]) wins the progressive pot + line payout
  const fiveWildsGrid: Grid = [
    ['WILD', 'WILD', 'WILD', 'WILD', 'WILD'],
    ['SNOWMAN', 'CANDY', 'BELL', 'REINDEER', 'CANDY'],
    ['STOCKING', 'TREE', 'REINDEER', 'SNOWMAN', 'BELL'],
  ];

  const spin2 = executeSpin(spin1.nextState, fiveWildsGrid);
  assert.equal(spin2.result.jackpotContribution, 1.0);
  assert.equal(spin2.result.jackpotWon, 10002.0);
  assert.ok(spin2.result.lineWinTotal >= 1000);
  assert.equal(spin2.result.totalWin, spin2.result.lineWinTotal + spin2.result.jackpotWon);
  assert.equal(spin2.nextState.progressiveJackpot, 10000);
});

test('rare volatility setting adjusts executeSpin payout variance on fixed grids', () => {
  const fourMatchAndScatterGrid: Grid = [
    ['TREE', 'TREE', 'TREE', 'TREE', 'CANDY'],
    ['SCATTER', 'CANDY', 'SCATTER', 'BELL', 'SCATTER'],
    ['CANDY', 'CANDY', 'CANDY', 'SNOWMAN', 'STOCKING'],
  ];

  const baseState = createInitialSlotState(10000);
  const rareState = createInitialSlotState(10000, 'rare');

  const baseSpin = executeSpin(baseState, fourMatchAndScatterGrid);
  const rareSpin = executeSpin(rareState, fourMatchAndScatterGrid);

  assert.equal(baseSpin.result.volatility, undefined);
  assert.equal(rareSpin.result.volatility, 'rare');

  // Base preserves 10 free spins; Rare scales 3-match down (0.75x), 4-match up (1.75x), scatter up (1.75x), +3 free spins
  assert.equal(baseSpin.result.freeSpinsAwarded, 10);
  assert.equal(rareSpin.result.freeSpinsAwarded, 13);
  assert.ok(rareSpin.result.scatterPayout > baseSpin.result.scatterPayout);
  assert.ok(rareSpin.result.totalWin > baseSpin.result.totalWin);
});

test('rare volatility produces lower hit rate and higher variance than standard reels over 1000 spins', () => {
  const makeRng = (seed: number) => {
    let a = seed;
    return () => {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const simulate = (mode?: 'rare') => {
    const rng = makeRng(20261115);
    let state = { ...createInitialSlotState(10000, mode), balance: 1_000_000 };
    let hits = 0;
    let totalWon = 0;
    const wins: number[] = [];
    const spins = 1000;

    for (let i = 0; i < spins; i++) {
      const { nextState, result } = executeSpin(state, undefined, rng);
      state = nextState;
      const win = result.totalWin - result.jackpotWon;
      if (win > 0) hits++;
      totalWon += win;
      wins.push(win);
    }

    const mean = totalWon / spins;
    const variance = wins.reduce((acc, w) => acc + (w - mean) ** 2, 0) / spins;
    return {
      hitRate: hits / spins,
      avgWinOnHit: hits > 0 ? totalWon / hits : 0,
      stdDev: Math.sqrt(variance),
    };
  };

  const stdMetrics = simulate();
  const rareMetrics = simulate('rare');

  assert.ok(
    rareMetrics.hitRate < stdMetrics.hitRate,
    `Expected rare hitRate (${rareMetrics.hitRate}) < standard (${stdMetrics.hitRate})`,
  );
  assert.ok(
    rareMetrics.avgWinOnHit > stdMetrics.avgWinOnHit,
    `Expected rare avgWinOnHit (${rareMetrics.avgWinOnHit}) > standard (${stdMetrics.avgWinOnHit})`,
  );
  assert.ok(
    rareMetrics.stdDev > stdMetrics.stdDev,
    `Expected rare stdDev (${rareMetrics.stdDev}) > standard (${stdMetrics.stdDev})`,
  );
});


