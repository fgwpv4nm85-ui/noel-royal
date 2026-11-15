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
  assert.equal(initialState.activeLines, 20);
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
  assert.equal(nextState.balance, 2490.0);
  assert.equal(formatEuro(nextState.balance), '2 490.00 €');
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
  // 3 Scatters = 5x Total Bet (5 * 20 = 100.00 €)
  assert.equal(result.scatterPayout, 100.0);
  assert.equal(nextState.freeSpinsRemaining, 10);
  // 2500 - 20 + 100 = 2580
  assert.equal(nextState.balance, 2580);

  // Now run a Free Spin with Showcase Grid -> Ligne 2 Gift 3x gets 3x multiplier = 30.00 €!
  const freeSpinOutcome = executeSpin(nextState, SHOWCASE_GRID);
  assert.equal(freeSpinOutcome.result.wasFreeSpin, true);
  assert.equal(freeSpinOutcome.result.multiplierApplied, 3);
  assert.equal(freeSpinOutcome.result.totalWin, 30.0);
  assert.equal(freeSpinOutcome.nextState.freeSpinsRemaining, 9);
  assert.equal(freeSpinOutcome.nextState.balance, 2610); // 2580 - 0 + 30
});

test('activeLines limits which paylines are evaluated', () => {
  // Showcase grid only wins on Line 2 (Top [0,0,0,0,0])
  const oneLineResult = evaluateGrid(SHOWCASE_GRID, 1, 1.0, false);
  assert.equal(oneLineResult.winningLines.length, 0);

  const twoLineResult = evaluateGrid(SHOWCASE_GRID, 2, 1.0, false);
  assert.equal(twoLineResult.winningLines.length, 1);
  assert.equal(twoLineResult.winningLines[0].lineId, 2);
});

test('max bet spin of 500.00 EUR and gameover detection work properly', () => {
  assert.equal(PAYLINES.length, 20);
  const state = {
    ...createInitialSlotState(),
    activeLines: 20,
    betPerLine: 25.0,
    balance: 500.0,
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

  // Regular 20.00 EUR spin contributes 2% = 0.40 EUR
  const spin1 = executeSpin(initial, SHOWCASE_GRID);
  assert.equal(spin1.result.jackpotContribution, 0.4);
  assert.equal(spin1.result.jackpotWon, 0);
  assert.equal(spin1.nextState.progressiveJackpot, 10000.4);

  // 5x WILD across Row 0 (Ligne 2 Haut [0,0,0,0,0]) wins the progressive pot + line payout
  const fiveWildsGrid: Grid = [
    ['WILD', 'WILD', 'WILD', 'WILD', 'WILD'],
    ['SNOWMAN', 'CANDY', 'BELL', 'REINDEER', 'CANDY'],
    ['STOCKING', 'TREE', 'REINDEER', 'SNOWMAN', 'BELL'],
  ];

  const spin2 = executeSpin(spin1.nextState, fiveWildsGrid);
  assert.equal(spin2.result.jackpotContribution, 0.4);
  assert.equal(spin2.result.jackpotWon, 10000.8);
  assert.ok(spin2.result.lineWinTotal >= 1000);
  assert.equal(spin2.result.totalWin, spin2.result.lineWinTotal + spin2.result.jackpotWon);
  assert.equal(spin2.nextState.progressiveJackpot, 10000);
});

