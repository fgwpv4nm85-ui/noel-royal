import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  BET_PER_LINE_OPTIONS,
  DEFAULT_ACTIVE_LINES,
  DEFAULT_BET_PER_LINE,
  PAYLINES,
  PROGRESSIVE_SEED,
  STARTING_BALANCE,
} from './constants';
import { createInitialSlotState, roundCurrency } from './engine';
import { SlotMachineState, SpinResult } from './types';

export interface CloudSpinEntry {
  id: string;
  totalBet: number;
  totalWin: number;
  balanceAfter: number;
  activeLines: number;
  betPerLine: number;
  wasFreeSpin: boolean;
  freeSpinsAwarded: number;
  winningLineCount: number;
  summary: string;
  createdAtMs: number;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  biggestWin: number;
  peakBalance: number;
  totalSpins: number;
}

function sanitizeDisplayName(user: User): string {
  const raw = user.displayName?.trim() || user.email?.split('@')[0] || 'Alpine Player';
  return raw.slice(0, 80) || 'Alpine Player';
}

function sanitizeSummary(summary: string): string {
  const cleaned = summary.trim().slice(0, 200);
  return cleaned.length > 0 ? cleaned : 'Spin completed';
}

function clampBetPerLine(val: number): number {
  const rounded = roundCurrency(val);
  const valid = BET_PER_LINE_OPTIONS.includes(
    rounded as (typeof BET_PER_LINE_OPTIONS)[number],
  );
  return valid ? rounded : DEFAULT_BET_PER_LINE;
}

function clampActiveLines(val: number): number {
  const intVal = Math.round(val);
  return Math.max(1, Math.min(PAYLINES.length, intVal || DEFAULT_ACTIVE_LINES));
}

async function fetchCurrentJackpotAmount(): Promise<number> {
  const jackpotPath = 'jackpots/progressive';
  const jackpotRef = doc(db, 'jackpots', 'progressive');
  try {
    const snap = await getDoc(jackpotRef);
    if (snap.exists()) {
      const amt = snap.data().amount;
      if (typeof amt === 'number' && Number.isFinite(amt)) {
        return Math.max(PROGRESSIVE_SEED, roundCurrency(amt));
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, jackpotPath);
  }
  return PROGRESSIVE_SEED;
}

export async function loadOrCreatePlayerState(user: User): Promise<SlotMachineState> {
  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);

  let snap;
  try {
    snap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  const jackpotAmount = await fetchCurrentJackpotAmount();

  if (snap.exists()) {
    const data = snap.data();
    return {
      balance:
        typeof data.balance === 'number' && Number.isFinite(data.balance)
          ? Math.max(0, roundCurrency(data.balance))
          : STARTING_BALANCE,
      progressiveJackpot: jackpotAmount,
      activeLines:
        typeof data.activeLines === 'number'
          ? clampActiveLines(data.activeLines)
          : DEFAULT_ACTIVE_LINES,
      betPerLine:
        typeof data.betPerLine === 'number'
          ? clampBetPerLine(data.betPerLine)
          : DEFAULT_BET_PER_LINE,
      freeSpinsRemaining:
        typeof data.freeSpinsRemaining === 'number'
          ? Math.max(0, Math.round(data.freeSpinsRemaining))
          : 0,
      freeSpinsTotalWin:
        typeof data.freeSpinsTotalWin === 'number'
          ? Math.max(0, roundCurrency(data.freeSpinsTotalWin))
          : 0,
      lastResult: null,
      stats: {
        totalSpins:
          typeof data.totalSpins === 'number' ? Math.max(0, Math.round(data.totalSpins)) : 0,
        totalWagered:
          typeof data.totalWagered === 'number'
            ? Math.max(0, roundCurrency(data.totalWagered))
            : 0,
        totalWon:
          typeof data.totalWon === 'number' ? Math.max(0, roundCurrency(data.totalWon)) : 0,
        biggestWin:
          typeof data.biggestWin === 'number'
            ? Math.max(0, roundCurrency(data.biggestWin))
            : 0,
        freeSpinsTriggered:
          typeof data.freeSpinsTriggered === 'number'
            ? Math.max(0, Math.round(data.freeSpinsTriggered))
            : 0,
        peakBalance:
          typeof data.peakBalance === 'number'
            ? Math.max(0, roundCurrency(data.peakBalance))
            : STARTING_BALANCE,
      },
    };
  }

  const initial = createInitialSlotState(jackpotAmount);
  const displayName = sanitizeDisplayName(user);
  const nowTs = serverTimestamp();

  try {
    await setDoc(userRef, {
      uid: user.uid,
      displayName,
      balance: initial.balance,
      activeLines: initial.activeLines,
      betPerLine: initial.betPerLine,
      freeSpinsRemaining: initial.freeSpinsRemaining,
      freeSpinsTotalWin: initial.freeSpinsTotalWin,
      totalSpins: initial.stats.totalSpins,
      totalWagered: initial.stats.totalWagered,
      totalWon: initial.stats.totalWon,
      biggestWin: initial.stats.biggestWin,
      freeSpinsTriggered: initial.stats.freeSpinsTriggered,
      peakBalance: initial.stats.peakBalance,
      createdAt: nowTs,
      updatedAt: nowTs,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, userPath);
  }

  return initial;
}

let spinWriteQueue: Promise<void> = Promise.resolve();

function getFirestoreErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code?: unknown }).code ?? '');
  }
  return '';
}

async function syncProgressiveJackpot(
  result: SpinResult,
  displayName: string,
): Promise<void> {
  const jackpotPath = 'jackpots/progressive';
  const jackpotRef = doc(db, 'jackpots', 'progressive');
  const clampedContribution = Math.max(
    0.1,
    Math.min(30, roundCurrency(result.jackpotContribution)),
  );

  if (result.jackpotWon > 0) {
    const wonAmount = Math.max(PROGRESSIVE_SEED, roundCurrency(result.jackpotWon));
    try {
      await updateDoc(jackpotRef, {
        amount: PROGRESSIVE_SEED,
        lastWinnerName: displayName,
        lastWonAmount: wonAmount,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (error) {
      if (getFirestoreErrorCode(error) === 'not-found') {
        try {
          await setDoc(jackpotRef, {
            amount: PROGRESSIVE_SEED,
            lastWinnerName: displayName,
            lastWonAmount: wonAmount,
            updatedAt: serverTimestamp(),
          });
          return;
        } catch (createError) {
          handleFirestoreError(createError, OperationType.WRITE, jackpotPath);
        }
      }
      handleFirestoreError(error, OperationType.UPDATE, jackpotPath);
    }
  }

  try {
    await updateDoc(jackpotRef, {
      amount: increment(clampedContribution),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    if (getFirestoreErrorCode(error) === 'not-found') {
      try {
        await setDoc(jackpotRef, {
          amount: roundCurrency(PROGRESSIVE_SEED + clampedContribution),
          lastWinnerName: 'Noël Royale',
          lastWonAmount: 0,
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (createError) {
        if (getFirestoreErrorCode(createError) === 'permission-denied') {
          try {
            await updateDoc(jackpotRef, {
              amount: increment(clampedContribution),
              updatedAt: serverTimestamp(),
            });
            return;
          } catch (retryError) {
            handleFirestoreError(retryError, OperationType.UPDATE, jackpotPath);
          }
        }
        handleFirestoreError(createError, OperationType.CREATE, jackpotPath);
      }
    }
    handleFirestoreError(error, OperationType.UPDATE, jackpotPath);
  }
}

async function commitSpinOutcome(
  user: User,
  nextState: SlotMachineState,
  result: SpinResult,
  summary: string,
): Promise<void> {
  const userPath = `users/${user.uid}`;
  const spinId = `spin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const spinPath = `users/${user.uid}/spins/${spinId}`;
  const leaderboardPath = `leaderboard/${user.uid}`;

  const batch = writeBatch(db);
  const userRef = doc(db, 'users', user.uid);
  const spinRef = doc(db, 'users', user.uid, 'spins', spinId);
  const leaderboardRef = doc(db, 'leaderboard', user.uid);

  const displayName = sanitizeDisplayName(user);
  const activeLines = clampActiveLines(nextState.activeLines);
  const betPerLine = clampBetPerLine(nextState.betPerLine);
  const totalBet = result.wasFreeSpin ? 0 : roundCurrency(activeLines * betPerLine);

  batch.update(userRef, {
    displayName,
    balance: Math.max(0, roundCurrency(nextState.balance)),
    activeLines,
    betPerLine,
    freeSpinsRemaining: Math.max(0, Math.round(nextState.freeSpinsRemaining)),
    freeSpinsTotalWin: Math.max(0, roundCurrency(nextState.freeSpinsTotalWin)),
    totalSpins: Math.max(0, Math.round(nextState.stats.totalSpins)),
    totalWagered: Math.max(0, roundCurrency(nextState.stats.totalWagered)),
    totalWon: Math.max(0, roundCurrency(nextState.stats.totalWon)),
    biggestWin: Math.max(0, roundCurrency(nextState.stats.biggestWin)),
    freeSpinsTriggered: Math.max(0, Math.round(nextState.stats.freeSpinsTriggered)),
    peakBalance: Math.max(0, roundCurrency(nextState.stats.peakBalance)),
    updatedAt: serverTimestamp(),
  });

  batch.set(spinRef, {
    uid: user.uid,
    totalBet: Math.max(0, Math.min(1250, totalBet)),
    totalWin: Math.max(0, roundCurrency(result.totalWin)),
    balanceAfter: Math.max(0, roundCurrency(nextState.balance)),
    activeLines,
    betPerLine,
    wasFreeSpin: Boolean(result.wasFreeSpin),
    freeSpinsAwarded: Math.max(0, Math.round(result.freeSpinsAwarded)),
    winningLineCount: Math.max(0, Math.min(PAYLINES.length, result.winningLines.length)),
    summary: sanitizeSummary(summary),
    createdAt: serverTimestamp(),
  });

  batch.set(
    leaderboardRef,
    {
      uid: user.uid,
      displayName,
      biggestWin: Math.max(0, roundCurrency(nextState.stats.biggestWin)),
      peakBalance: Math.max(0, roundCurrency(nextState.stats.peakBalance)),
      totalSpins: Math.max(0, Math.round(nextState.stats.totalSpins)),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.WRITE,
      `${userPath} | ${spinPath} | ${leaderboardPath}`,
    );
  }

  await syncProgressiveJackpot(result, displayName);
}

export function saveSpinOutcome(
  user: User,
  nextState: SlotMachineState,
  result: SpinResult,
  summary: string,
): Promise<void> {
  const queued = spinWriteQueue.then(() => commitSpinOutcome(user, nextState, result, summary));
  spinWriteQueue = queued.catch(() => {});
  return queued;
}

export async function saveProfileState(user: User, state: SlotMachineState): Promise<void> {
  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);

  try {
    await updateDoc(userRef, {
      displayName: sanitizeDisplayName(user),
      balance: Math.max(0, roundCurrency(state.balance)),
      activeLines: clampActiveLines(state.activeLines),
      betPerLine: clampBetPerLine(state.betPerLine),
      freeSpinsRemaining: Math.max(0, Math.round(state.freeSpinsRemaining)),
      freeSpinsTotalWin: Math.max(0, roundCurrency(state.freeSpinsTotalWin)),
      totalSpins: Math.max(0, Math.round(state.stats.totalSpins)),
      totalWagered: Math.max(0, roundCurrency(state.stats.totalWagered)),
      totalWon: Math.max(0, roundCurrency(state.stats.totalWon)),
      biggestWin: Math.max(0, roundCurrency(state.stats.biggestWin)),
      freeSpinsTriggered: Math.max(0, Math.round(state.stats.freeSpinsTriggered)),
      peakBalance: Math.max(0, roundCurrency(state.stats.peakBalance)),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export function subscribeProgressiveJackpot(
  onUpdate: (amount: number, lastWinnerName?: string, lastWonAmount?: number) => void,
  onError?: (err: unknown) => void,
): () => void {
  const path = 'jackpots/progressive';
  const jackpotRef = doc(db, 'jackpots', 'progressive');

  return onSnapshot(
    jackpotRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(PROGRESSIVE_SEED);
        return;
      }
      const data = snapshot.data();
      const amount =
        typeof data.amount === 'number' && Number.isFinite(data.amount)
          ? Math.max(PROGRESSIVE_SEED, roundCurrency(data.amount))
          : PROGRESSIVE_SEED;
      const lastWinnerName =
        typeof data.lastWinnerName === 'string' ? data.lastWinnerName : undefined;
      const lastWonAmount =
        typeof data.lastWonAmount === 'number' ? roundCurrency(data.lastWonAmount) : undefined;
      onUpdate(amount, lastWinnerName, lastWonAmount);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    },
  );
}

export function subscribeLeaderboard(
  onData: (entries: LeaderboardEntry[]) => void,
  onError?: (err: unknown) => void,
): () => void {
  const path = 'leaderboard';
  const q = query(
    collection(db, path),
    where('biggestWin', '>=', 0),
    orderBy('biggestWin', 'desc'),
    limit(8),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: LeaderboardEntry[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          uid: String(data.uid ?? d.id),
          displayName: String(data.displayName ?? 'Player'),
          biggestWin: Number(data.biggestWin ?? 0),
          peakBalance: Number(data.peakBalance ?? 0),
          totalSpins: Number(data.totalSpins ?? 0),
        };
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    },
  );
}

export function subscribeRecentSpins(
  uid: string,
  onData: (entries: CloudSpinEntry[]) => void,
  onError?: (err: unknown) => void,
): () => void {
  const path = `users/${uid}/spins`;
  const q = query(
    collection(db, 'users', uid, 'spins'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(12),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: CloudSpinEntry[] = snapshot.docs.map((d) => {
        const data = d.data();
        const ts = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
        return {
          id: d.id,
          totalBet: Number(data.totalBet ?? 0),
          totalWin: Number(data.totalWin ?? 0),
          balanceAfter: Number(data.balanceAfter ?? 0),
          activeLines: Number(data.activeLines ?? DEFAULT_ACTIVE_LINES),
          betPerLine: Number(data.betPerLine ?? 1),
          wasFreeSpin: Boolean(data.wasFreeSpin),
          freeSpinsAwarded: Number(data.freeSpinsAwarded ?? 0),
          winningLineCount: Number(data.winningLineCount ?? 0),
          summary: String(data.summary ?? ''),
          createdAtMs: ts,
        };
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    },
  );
}
