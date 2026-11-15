import React, { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  BookOpen,
  LogIn,
  LogOut,
  Minus,
  Pause,
  Plus,
  Repeat,
  Square,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { CloudLedgerModal } from './components/CloudLedgerModal';
import { PaylineOverlay } from './components/PaylineOverlay';
import { PaytableModal } from './components/PaytableModal';
import { SlotSymbolArt } from './components/SlotSymbolArt';
import { SnowCanvas } from './components/SnowCanvas';
import { StatusModal } from './components/StatusModal';
import { TitleScreen } from './components/TitleScreen';
import { auth, signInWithGoogle, signOutUser } from './firebase';
import { slotAudio } from './game/audio';
import {
  CloudSpinEntry,
  LeaderboardEntry,
  loadOrCreatePlayerState,
  saveProfileState,
  saveSpinOutcome,
  subscribeLeaderboard,
  subscribeProgressiveJackpot,
  subscribeRecentSpins,
} from './game/cloudSync';
import {
  BET_PER_LINE_OPTIONS,
  formatEuro,
  PAYLINES,
  SHOWCASE_GRID,
  SYMBOLS,
} from './game/constants';
import {
  canAffordSpin,
  createInitialSlotState,
  executeSpin,
  isGameOver,
  roundCurrency,
  spinReels,
} from './game/engine';
import { GameState, Grid, SlotMachineState, SpinResult } from './game/types';

const LEFT_PIN_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const RIGHT_PIN_IDS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

function getInitialGameState(): GameState {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return 'playing';
    }
  }
  return 'title';
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState);
  const [slotState, setSlotState] = useState<SlotMachineState>(createInitialSlotState);
  const [displayGrid, setDisplayGrid] = useState<Grid>(SHOWCASE_GRID);
  const [spinningReels, setSpinningReels] = useState<[boolean, boolean, boolean, boolean, boolean]>([
    false,
    false,
    false,
    false,
    false,
  ]);
  const [reelBlurGrid, setReelBlurGrid] = useState<Grid>(SHOWCASE_GRID);
  const [isSpinning, setIsSpinning] = useState(false);
  const [settledReels, setSettledReels] = useState<[boolean, boolean, boolean, boolean, boolean]>([
    false,
    false,
    false,
    false,
    false,
  ]);

  const [paytableOpen, setPaytableOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [recentSpins, setRecentSpins] = useState<CloudSpinEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [previewLineId, setPreviewLineId] = useState<number | null>(null);
  const [activeWinCycleIdx, setActiveWinCycleIdx] = useState(0);
  const [burstCounter, setBurstCounter] = useState(0);
  const [isBigBurst, setIsBigBurst] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    'Cabinet ready · Match 3+ symbols left to right on 20 paylines',
  );

  const timersRef = useRef<number[]>([]);
  const cycleIntervalRef = useRef<number | null>(null);
  const pendingSpinRef = useRef<{
    current: SlotMachineState;
    nextState: SlotMachineState;
    result: SpinResult;
  } | null>(null);
  const slotStateRef = useRef(slotState);
  slotStateRef.current = slotState;

  const userRef = useRef<User | null>(user);
  userRef.current = user;

  const isSpinningRef = useRef(isSpinning);
  isSpinningRef.current = isSpinning;

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const isAutoSpinRef = useRef(isAutoSpin);
  isAutoSpinRef.current = isAutoSpin;

  const isTurboRef = useRef(isTurbo);
  isTurboRef.current = isTurbo;

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (cycleIntervalRef.current !== null) {
      window.clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
  }, []);

  // Sync game state to body[data-state]
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Clear timers on unmount
  useEffect(() => clearAllTimers, [clearAllTimers]);

  // Listen to Firebase Auth state & hydrate player's Firestore bankroll
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser) {
        try {
          const loaded = await loadOrCreatePlayerState(nextUser);
          setSlotState(loaded);
          setStatusMessage(
            `Cloud ledger synced · Welcome back, ${nextUser.displayName?.split(' ')[0] || 'Player'}`,
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : '';
          if (msg.includes('Quota exceeded')) {
            setStatusMessage('Firestore daily quota exceeded — playing in local session mode.');
          }
        }
      } else {
        setRecentSpins([]);
      }
    });
    return unsubscribe;
  }, []);

  // Subscribe to shared Progressive Jackpot once auth readiness is settled
  useEffect(() => {
    if (!authReady) return;
    const unsubJackpot = subscribeProgressiveJackpot(
      (amount) => {
        if (isSpinningRef.current) return;
        setSlotState((prev) =>
          prev.progressiveJackpot === amount
            ? prev
            : { ...prev, progressiveJackpot: amount },
        );
      },
      () => {
        // Error already structured via handleFirestoreError
      },
    );
    return unsubJackpot;
  }, [authReady]);

  // Attach Ledger listeners only when Ledger modal is open and auth is ready
  useEffect(() => {
    if (!authReady || !ledgerOpen) return;
    const unsubBoard = subscribeLeaderboard(
      (entries) => setLeaderboard(entries),
      () => {
        // Error already structured via handleFirestoreError
      },
    );
    let unsubSpins: (() => void) | undefined;
    if (user) {
      unsubSpins = subscribeRecentSpins(
        user.uid,
        (entries) => setRecentSpins(entries),
        () => {
          // Error already structured via handleFirestoreError
        },
      );
    }
    return () => {
      unsubBoard();
      if (unsubSpins) unsubSpins();
    };
  }, [authReady, ledgerOpen, user]);

  const handleSignIn = useCallback(async () => {
    slotAudio.playClick();
    setAuthBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setStatusMessage('Sign-in cancelled or blocked — continuing in local session.');
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    slotAudio.playClick();
    setAuthBusy(true);
    try {
      await signOutUser();
      setStatusMessage('Signed out — playing in local session mode.');
    } catch (err) {
      console.error('Sign-out failed:', err);
    } finally {
      setAuthBusy(false);
    }
  }, []);

  // Cycle reel blur symbols smoothly while any reel is spinning
  useEffect(() => {
    if (!isSpinning) return;
    const interval = window.setInterval(() => {
      setReelBlurGrid(spinReels());
    }, 85);
    return () => window.clearInterval(interval);
  }, [isSpinning]);

  // Cycle highlighted winning paylines when multiple lines win
  useEffect(() => {
    if (cycleIntervalRef.current !== null) {
      window.clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    const wins = slotState.lastResult?.winningLines ?? [];
    if (wins.length > 1 && !isSpinning) {
      cycleIntervalRef.current = window.setInterval(() => {
        setActiveWinCycleIdx((prev) => (prev + 1) % wins.length);
      }, 1600);
    }
    return () => {
      if (cycleIntervalRef.current !== null) {
        window.clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
    };
  }, [slotState.lastResult, isSpinning]);

  const formatResultSummary = useCallback((result: SpinResult): string => {
    if (result.jackpotWon > 0) {
      return `LOT PROGRESSIF REMPORTÉ ! 5× Père Noël (WILD) · +${formatEuro(result.totalWin)} !`;
    }
    if (result.freeSpinsAwarded > 0) {
      return `North Star Bonus! ${result.scatterCount}× Scatters awarded ${result.freeSpinsAwarded} Free Spins (3× Multiplier) · +${formatEuro(result.totalWin)}`;
    }
    if (result.winningLines.length === 1) {
      const w = result.winningLines[0];
      const symName = SYMBOLS[w.symbolId].name;
      const multNote = w.appliedMultiplier > 1 ? ` · ${w.appliedMultiplier}× Free Spin` : '';
      return `${w.lineName}: ${w.matchCount}× ${symName}${w.usedWild ? ' (with Wild)' : ''}${multNote} · +${formatEuro(result.totalWin)}`;
    }
    if (result.winningLines.length > 1) {
      const multNote = result.multiplierApplied > 1 ? ` (${result.multiplierApplied}× Free Spin)` : '';
      return `${result.winningLines.length} Winning Paylines${multNote} · Total Win +${formatEuro(result.totalWin)}`;
    }
    if (result.scatterCount === 2) {
      return '2× North Stars landed — 1 more triggers 3× Free Spins!';
    }
    return 'No winning line this spin — spin again!';
  }, []);

  const triggerSpinRef = useRef<(overrideState?: SlotMachineState) => void>(() => {});

  const finalizeSpin = useCallback(
    (pending: {
      current: SlotMachineState;
      nextState: SlotMachineState;
      result: SpinResult;
    }) => {
      clearAllTimers();
      pendingSpinRef.current = null;
      const { current, nextState, result } = pending;

      setDisplayGrid(result.grid);
      setSpinningReels([false, false, false, false, false]);
      setSettledReels([true, true, true, true, true]);

      const summaryText = formatResultSummary(result);
      setSlotState(nextState);
      setIsSpinning(false);
      setStatusMessage(summaryText);

      if (userRef.current) {
        void saveSpinOutcome(userRef.current, nextState, result, summaryText).catch((err) => {
          const msg = err instanceof Error ? err.message : '';
          if (msg.includes('Quota exceeded')) {
            setStatusMessage('Firestore daily quota exceeded — spin kept locally.');
          }
        });
      }

      const totalBetRef = Math.max(1, roundCurrency(current.activeLines * current.betPerLine));
      const bigWin =
        result.jackpotWon > 0 ||
        result.totalWin >= totalBetRef * 5 ||
        result.freeSpinsAwarded > 0;

      if (result.jackpotWon > 0 || result.freeSpinsAwarded > 0) {
        slotAudio.playFreeSpinsTrigger();
      } else if (result.totalWin > 0) {
        slotAudio.playWin(bigWin);
      }

      if (result.totalWin > 0) {
        setIsBigBurst(bigWin);
        setBurstCounter((c) => c + 1);
      }

      if (isGameOver(nextState)) {
        setIsAutoSpin(false);
        const overTimer = window.setTimeout(() => {
          setGameState('gameover');
        }, 650);
        timersRef.current.push(overTimer);
      } else if (isAutoSpinRef.current) {
        const turbo = isTurboRef.current;
        const autoDelay = result.totalWin > 0 ? (turbo ? 600 : 1200) : turbo ? 260 : 520;
        const nextAutoTimer = window.setTimeout(() => {
          if (isAutoSpinRef.current && gameStateRef.current === 'playing') {
            triggerSpinRef.current(nextState);
          }
        }, autoDelay);
        timersRef.current.push(nextAutoTimer);
      }
    },
    [clearAllTimers, formatResultSummary],
  );

  const handleStopReels = useCallback(() => {
    const pending = pendingSpinRef.current;
    if (!isSpinningRef.current || !pending) return;
    const anyScatter = pending.result.grid.some((row) => row.includes('SCATTER'));
    slotAudio.playReelStop(4, anyScatter);
    finalizeSpin(pending);
  }, [finalizeSpin]);

  const triggerSpin = useCallback(
    (overrideState?: SlotMachineState) => {
      if (isSpinningRef.current || gameStateRef.current !== 'playing') return;

      const current = overrideState ?? slotStateRef.current;
      if (!canAffordSpin(current)) {
        setIsAutoSpin(false);
        if (isGameOver(current)) {
          setGameState('gameover');
        } else {
          setStatusMessage('Insufficient balance for current bet — lower bet/lines or reset bankroll.');
        }
        return;
      }

      clearAllTimers();
      setPreviewLineId(null);
      setActiveWinCycleIdx(0);
      setIsSpinning(true);
      setSpinningReels([true, true, true, true, true]);
      setSettledReels([false, false, false, false, false]);

      const { nextState, result } = executeSpin(current);
      const pending = { current, nextState, result };
      pendingSpinRef.current = pending;

      const isFree = current.freeSpinsRemaining > 0;
      const wagerThisSpin = isFree ? 0 : roundCurrency(current.activeLines * current.betPerLine);
      const balanceBeforeResult = roundCurrency(current.balance - wagerThisSpin);

      // Immediately deduct bet and clear previous win highlight
      setSlotState({
        ...current,
        balance: balanceBeforeResult,
        progressiveJackpot: nextState.progressiveJackpot,
        freeSpinsRemaining: isFree ? current.freeSpinsRemaining - 1 : current.freeSpinsRemaining,
        lastResult: null,
      });

      setStatusMessage(
        isFree
          ? `Free Spin active (3× Multiplier) · ${Math.max(0, current.freeSpinsRemaining - 1)} remaining...`
          : `Spinning 5 reels · Bet ${formatEuro(wagerThisSpin)}...`,
      );
      slotAudio.playSpinStart();

      const turbo = isTurboRef.current;
      const baseDelay = turbo ? 150 : 380;
      const stepDelay = turbo ? 75 : 185;

      for (let col = 0; col < 5; col++) {
        const stopAt = baseDelay + col * stepDelay;
        const t = window.setTimeout(() => {
          if (pendingSpinRef.current !== pending) return;

          setDisplayGrid((prev) => {
            const updated: Grid = [
              [...prev[0]] as Grid[0],
              [...prev[1]] as Grid[1],
              [...prev[2]] as Grid[2],
            ];
            updated[0][col] = result.grid[0][col];
            updated[1][col] = result.grid[1][col];
            updated[2][col] = result.grid[2][col];
            return updated;
          });

          setSpinningReels((prev) => {
            const copy = [...prev] as [boolean, boolean, boolean, boolean, boolean];
            copy[col] = false;
            return copy;
          });
          setSettledReels((prev) => {
            const copy = [...prev] as [boolean, boolean, boolean, boolean, boolean];
            copy[col] = true;
            return copy;
          });

          const colHasScatter =
            result.grid[0][col] === 'SCATTER' ||
            result.grid[1][col] === 'SCATTER' ||
            result.grid[2][col] === 'SCATTER';
          slotAudio.playReelStop(col, colHasScatter);

          if (col === 4) {
            finalizeSpin(pending);
          }
        }, stopAt);
        timersRef.current.push(t);
      }
    },
    [clearAllTimers, finalizeSpin],
  );

  triggerSpinRef.current = triggerSpin;

  const handleStartGame = useCallback(() => {
    slotAudio.playClick();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setGameState('playing');
  }, []);

  const handleResetBankroll = useCallback(() => {
    slotAudio.playClick();
    clearAllTimers();
    pendingSpinRef.current = null;
    setIsSpinning(false);
    setSpinningReels([false, false, false, false, false]);
    setIsAutoSpin(false);
    const fresh: SlotMachineState = {
      ...createInitialSlotState(slotStateRef.current.progressiveJackpot),
      stats: slotStateRef.current.stats,
    };
    setSlotState(fresh);
    setDisplayGrid(SHOWCASE_GRID);
    setStatusMessage('Bankroll reset to 2 500.00 € · Ready to spin');
    setGameState('playing');
    if (userRef.current) {
      void saveProfileState(userRef.current, fresh).catch(() => {});
    }
  }, [clearAllTimers]);

  const handleBetMax = useCallback(() => {
    if (isSpinning || slotState.freeSpinsRemaining > 0) return;
    slotAudio.playClick();
    const maxState: SlotMachineState = {
      ...slotState,
      activeLines: 20,
      betPerLine: 25.0,
    };
    setSlotState(maxState);
    if (canAffordSpin(maxState)) {
      triggerSpin(maxState);
    } else {
      setStatusMessage('Balance below 500.00 € Max Bet — lower bet/line to spin.');
    }
  }, [isSpinning, slotState, triggerSpin]);

  const handleAdjustLines = (delta: number) => {
    if (isSpinning || slotState.freeSpinsRemaining > 0) return;
    slotAudio.playClick();
    setSlotState((prev) => {
      const next = {
        ...prev,
        activeLines: Math.max(1, Math.min(20, prev.activeLines + delta)),
      };
      if (userRef.current) {
        void saveProfileState(userRef.current, next).catch(() => {});
      }
      return next;
    });
  };

  const handleAdjustBetPerLine = (deltaIdx: number) => {
    if (isSpinning || slotState.freeSpinsRemaining > 0) return;
    slotAudio.playClick();
    setSlotState((prev) => {
      const idx = BET_PER_LINE_OPTIONS.indexOf(
        prev.betPerLine as (typeof BET_PER_LINE_OPTIONS)[number],
      );
      const currentIdx = idx === -1 ? 3 : idx;
      const nextIdx = Math.max(
        0,
        Math.min(BET_PER_LINE_OPTIONS.length - 1, currentIdx + deltaIdx),
      );
      const next = {
        ...prev,
        betPerLine: BET_PER_LINE_OPTIONS[nextIdx],
      };
      if (userRef.current) {
        void saveProfileState(userRef.current, next).catch(() => {});
      }
      return next;
    });
  };

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      slotAudio.setMuted(next);
      return next;
    });
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (paytableOpen || ledgerOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setPaytableOpen(false);
          setLedgerOpen(false);
        } else if (paytableOpen && e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setPaytableOpen(false);
        }
        return;
      }

      if (gameState === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartGame();
        } else if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setPaytableOpen(true);
        }
        return;
      }

      if (gameState === 'paused') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setGameState('playing');
        }
        return;
      }

      if (gameState === 'gameover') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleResetBankroll();
        }
        return;
      }

      // Playing state shortcuts
      if (e.key === ' ') {
        e.preventDefault();
        if (isSpinningRef.current) {
          handleStopReels();
        } else {
          triggerSpin();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsAutoSpin(false);
        setGameState('paused');
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPaytableOpen(true);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleBetMax();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameState,
    paytableOpen,
    ledgerOpen,
    handleStartGame,
    handleResetBankroll,
    handleStopReels,
    triggerSpin,
    toggleMute,
    handleBetMax,
  ]);

  const totalBet = roundCurrency(slotState.activeLines * slotState.betPerLine);
  const lastWin = slotState.lastResult?.totalWin ?? 0;
  const winningLines = slotState.lastResult?.winningLines ?? [];
  const scatterPositions = slotState.lastResult?.scatterPositions ?? [];

  // Highlight cells belonging to the currently cycled winning line (or scatters if 3+)
  const highlightedCellSet = new Set<string>();
  if (!isSpinning && winningLines.length > 0) {
    const activeLine = winningLines[activeWinCycleIdx % winningLines.length];
    activeLine.positions.forEach(([r, c]) => highlightedCellSet.add(`${r}-${c}`));
  }
  if (!isSpinning && (slotState.lastResult?.scatterCount ?? 0) >= 3) {
    scatterPositions.forEach(([r, c]) => highlightedCellSet.add(`${r}-${c}`));
  }

  return (
    <div className="relative min-h-screen w-full bg-[#081510] text-[#FAF6EE] flex flex-col overflow-x-hidden">
      <SnowCanvas
        burstKey={burstCounter}
        isBigBurst={isBigBurst}
        paused={paytableOpen || ledgerOpen || gameState === 'paused' || gameState === 'gameover'}
      />

      {gameState === 'title' ? (
        <TitleScreen
          onStart={handleStartGame}
          onOpenPaytable={() => {
            slotAudio.playClick();
            setPaytableOpen(true);
          }}
          user={user}
          authBusy={authBusy}
          onSignIn={() => void handleSignIn()}
          onSignOut={() => void handleSignOut()}
        />
      ) : (
        <div className="relative z-10 flex-1 flex flex-col justify-between max-w-6xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-4 gap-3">
          {/* Perimeter Top HUD */}
          <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#19110C]/95 border border-[#D4AF37]/40 shadow-lg">
            {/* Cabinet Wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <svg viewBox="0 0 28 28" className="w-7 h-7" aria-hidden="true">
                <path
                  d="M14 2 L17.2 10.8 L26 14 L17.2 17.2 L14 26 L10.8 17.2 L2 14 L10.8 10.8 Z"
                  fill="#F59E0B"
                  stroke="#FEF3C7"
                  strokeWidth="1.2"
                />
              </svg>
              <span className="font-display text-lg sm:text-xl font-bold tracking-wider text-[#FDE68A] whitespace-nowrap">
                NOËL ROYALE
              </span>
            </div>

            {/* Key Perimeter Telemetry Readouts */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#A7B5AD]">
                  Balance
                </div>
                <div
                  data-testid="balance-readout"
                  className="font-mono text-base sm:text-xl font-bold text-[#FAF6EE] tabular-nums whitespace-nowrap"
                >
                  {formatEuro(slotState.balance)}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#A7B5AD]">
                  Last Win
                </div>
                <div
                  data-testid="win-readout"
                  className={`font-mono text-base sm:text-xl font-bold tabular-nums whitespace-nowrap ${
                    lastWin > 0 ? 'text-[#FDE047]' : 'text-[#CBD5E1]'
                  }`}
                >
                  {formatEuro(lastWin)}
                </div>
              </div>

              <div className="px-3 py-1 rounded-lg bg-[#2B1810] border border-[#F59E0B]/60">
                <div className="text-[10px] uppercase tracking-widest text-[#FDE68A]">
                  Lot Progressif
                </div>
                <div
                  data-testid="jackpot-readout"
                  className="font-mono text-base sm:text-xl font-bold text-[#FDE047] tabular-nums whitespace-nowrap"
                >
                  {formatEuro(slotState.progressiveJackpot)}
                </div>
              </div>

              {slotState.freeSpinsRemaining > 0 && (
                <div className="px-3 py-1 rounded-md bg-[#B91C1C] border border-[#FDE68A]/70">
                  <div className="text-[10px] uppercase tracking-widest text-[#FEF3C7]">
                    Free Spins · 3×
                  </div>
                  <div
                    data-testid="freespins-readout"
                    className="font-mono text-base font-bold text-white tabular-nums text-center"
                  >
                    {slotState.freeSpinsRemaining}
                  </div>
                </div>
              )}
            </div>

            {/* Utility Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  slotAudio.playClick();
                  setLedgerOpen(true);
                }}
                aria-label="Open ledger and leaderboard"
                title="Ledger & Hall of Fame"
                className="h-10 px-3 rounded-lg bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border border-[#D4AF37]/35 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Ledger</span>
              </button>

              {user ? (
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={authBusy}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    void handleSignOut();
                  }}
                  aria-label="Sign out"
                  title={`Signed in as ${user.displayName || user.email || 'Player'}`}
                  className="h-10 px-3 rounded-lg bg-[#101F18] hover:bg-[#19352A] disabled:opacity-50 text-[#E2DDD3] border border-[#D4AF37]/35 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">
                    {user.displayName ? user.displayName.split(' ')[0] : 'Sign out'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={authBusy}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    void handleSignIn();
                  }}
                  aria-label="Sign in with Google"
                  title="Sign in to save bankroll"
                  className="h-10 px-3 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] disabled:opacity-50 text-[#FAF6EE] border border-[#FDE68A]/50 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden md:inline">
                    {authBusy ? 'Signing in...' : 'Sign in'}
                  </span>
                </button>
              )}

              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  slotAudio.playClick();
                  setPaytableOpen(true);
                }}
                aria-label="Open paytable"
                title="Paytable [P]"
                className="h-10 px-3 rounded-lg bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border border-[#D4AF37]/35 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Paytable</span>
              </button>

              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  toggleMute();
                }}
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                title="Mute [M]"
                className="w-10 h-10 rounded-lg bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border border-[#D4AF37]/35 flex items-center justify-center transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setIsAutoSpin(false);
                  setGameState('paused');
                }}
                aria-label="Pause game"
                title="Pause [Esc]"
                className="w-10 h-10 rounded-lg bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border border-[#D4AF37]/35 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Centerpiece: 5x3 Mahogany & Brass Reel Cabinet */}
          <main className="flex-1 flex flex-col justify-center gap-2.5 min-h-0">
            <div
              className={`relative p-2.5 sm:p-4 rounded-2xl border-2 shadow-[0_18px_45px_rgba(0,0,0,0.65)] transition-colors duration-300 ${
                slotState.freeSpinsRemaining > 0
                  ? 'bg-[#3A1414] border-[#FDE047]/80'
                  : 'bg-[#2B1810] border-[#D4AF37]/60'
              }`}
            >
              {/* Inner Cabinet Brass Rim */}
              <div className="flex items-stretch gap-1.5 sm:gap-2.5">
                {/* Left Payline Pins (1–10) */}
                <div
                  className="hidden md:flex flex-col justify-between py-1 shrink-0"
                  aria-label="Paylines 1 to 10"
                >
                  {LEFT_PIN_IDS.map((id) => {
                    const line = PAYLINES[id - 1];
                    const enabled = id <= slotState.activeLines;
                    const isWinner =
                      !isSpinning && winningLines.some((w) => w.lineId === id);
                    return (
                      <button
                        key={id}
                        type="button"
                        tabIndex={-1}
                        onMouseEnter={() => setPreviewLineId(id)}
                        onMouseLeave={() => setPreviewLineId(null)}
                        onClick={() =>
                          setPreviewLineId((curr) => (curr === id ? null : id))
                        }
                        aria-label={`Preview ${line.name}`}
                        className={`w-7 h-6 rounded text-[11px] font-mono font-bold tabular-nums transition-transform cursor-pointer border ${
                          isWinner
                            ? 'scale-110 text-[#0B1712] border-white'
                            : enabled
                              ? 'bg-[#101F18] text-[#FAF6EE] border-[#D4AF37]/40 hover:border-[#FDE68A]'
                              : 'bg-[#140B07] text-[#64748B] border-white/10'
                        }`}
                        style={isWinner ? { backgroundColor: line.color } : undefined}
                      >
                        {id}
                      </button>
                    );
                  })}
                </div>

                {/* 5x3 Reel Window */}
                <div
                  data-testid="reel-grid"
                  className="relative flex-1 grid grid-cols-5 gap-1.5 sm:gap-2.5 p-2 sm:p-3 rounded-xl bg-[#0D1914] border border-[#D4AF37]/40 overflow-hidden"
                >
                  <PaylineOverlay
                    winningLines={isSpinning ? [] : winningLines}
                    activeCycleIndex={activeWinCycleIdx}
                    previewLineId={previewLineId}
                  />

                  {[0, 1, 2, 3, 4].map((col) => {
                    const reelBusy = spinningReels[col];
                    const reelSettled = settledReels[col];
                    return (
                      <div
                        key={col}
                        className="flex flex-col gap-1.5 sm:gap-2.5 overflow-hidden"
                      >
                        {[0, 1, 2].map((row) => {
                          const symId = reelBusy
                            ? reelBlurGrid[row][col]
                            : displayGrid[row][col];
                          const isHighlighted = highlightedCellSet.has(`${row}-${col}`);
                          const hasWinOnGrid = !isSpinning && highlightedCellSet.size > 0;
                          return (
                            <div
                              key={`${row}-${col}`}
                              data-testid={`cell-${row}-${col}`}
                              data-symbol={symId}
                              className={`relative aspect-[4/3] sm:aspect-[5/4] max-h-[124px] rounded-lg flex items-center justify-center border transition-all duration-150 ${
                                isHighlighted
                                  ? 'bg-[#FEF9C3] border-[#F59E0B] ring-2 ring-[#FDE047] shadow-[0_0_18px_rgba(245,158,11,0.55)] z-10'
                                  : hasWinOnGrid
                                    ? 'bg-[#EAE2CE] border-[#8C7A5B]/50 opacity-75'
                                    : 'bg-[#FAF6EE] border-[#C8B898]'
                              } ${reelBusy ? 'animate-reel-cycle' : reelSettled ? 'animate-reel-settle' : ''}`}
                            >
                              <SlotSymbolArt
                                symbolId={symId}
                                className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 ${
                                  isHighlighted ? 'animate-win-tile' : ''
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Right Payline Pins (11–20) */}
                <div
                  className="hidden md:flex flex-col justify-between py-1 shrink-0"
                  aria-label="Paylines 11 to 20"
                >
                  {RIGHT_PIN_IDS.map((id) => {
                    const line = PAYLINES[id - 1];
                    const enabled = id <= slotState.activeLines;
                    const isWinner =
                      !isSpinning && winningLines.some((w) => w.lineId === id);
                    return (
                      <button
                        key={id}
                        type="button"
                        tabIndex={-1}
                        onMouseEnter={() => setPreviewLineId(id)}
                        onMouseLeave={() => setPreviewLineId(null)}
                        onClick={() =>
                          setPreviewLineId((curr) => (curr === id ? null : id))
                        }
                        aria-label={`Preview ${line.name}`}
                        className={`w-7 h-6 rounded text-[11px] font-mono font-bold tabular-nums transition-transform cursor-pointer border ${
                          isWinner
                            ? 'scale-110 text-[#0B1712] border-white'
                            : enabled
                              ? 'bg-[#101F18] text-[#FAF6EE] border-[#D4AF37]/40 hover:border-[#FDE68A]'
                              : 'bg-[#140B07] text-[#64748B] border-white/10'
                        }`}
                        style={isWinner ? { backgroundColor: line.color } : undefined}
                      >
                        {id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Spin Evaluation Ticker Bar */}
              <div
                data-testid="status-message"
                className="mt-2.5 px-3 py-2 rounded-lg bg-[#101F18] border border-[#D4AF37]/30 flex items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <span className="text-[#FAF6EE] font-medium truncate">
                  {statusMessage}
                </span>
                {winningLines.length > 1 && !isSpinning && (
                  <span className="font-mono text-xs text-[#FDE68A] tabular-nums shrink-0">
                    Line {(activeWinCycleIdx % winningLines.length) + 1}/{winningLines.length}
                  </span>
                )}
              </div>
            </div>
          </main>

          {/* Unified Bottom Betting & Spin Control Dock */}
          <section
            aria-label="Slot Controls"
            className="px-3 sm:px-5 py-3 rounded-xl bg-[#19110C]/95 border border-[#D4AF37]/45 shadow-xl flex flex-wrap items-center justify-between gap-3"
          >
            {/* Left Group: Lines & Bet/Line */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              {/* Active Lines Stepper */}
              <div className="flex items-center gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#A7B5AD]">
                    Lines
                  </div>
                  <div
                    data-testid="lines-readout"
                    className="font-mono text-sm sm:text-base font-bold text-[#FAF6EE] tabular-nums"
                  >
                    {slotState.activeLines}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={isSpinning || slotState.freeSpinsRemaining > 0 || slotState.activeLines <= 1}
                    onClick={() => handleAdjustLines(-1)}
                    aria-label="Decrease active lines"
                    className="w-10 h-10 rounded-lg bg-[#101F18] hover:bg-[#19352A] disabled:opacity-40 text-[#FDE68A] border border-[#D4AF37]/30 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isSpinning || slotState.freeSpinsRemaining > 0 || slotState.activeLines >= 20}
                    onClick={() => handleAdjustLines(1)}
                    aria-label="Increase active lines"
                    className="w-10 h-10 rounded-lg bg-[#101F18] hover:bg-[#19352A] disabled:opacity-40 text-[#FDE68A] border border-[#D4AF37]/30 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bet / Line Stepper */}
              <div className="flex items-center gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#A7B5AD]">
                    Bet / Line
                  </div>
                  <div
                    data-testid="bet-per-line-readout"
                    className="font-mono text-sm sm:text-base font-bold text-[#FAF6EE] tabular-nums"
                  >
                    {formatEuro(slotState.betPerLine)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={
                      isSpinning ||
                      slotState.freeSpinsRemaining > 0 ||
                      slotState.betPerLine <= BET_PER_LINE_OPTIONS[0]
                    }
                    onClick={() => handleAdjustBetPerLine(-1)}
                    aria-label="Decrease bet per line"
                    className="w-10 h-10 rounded-lg bg-[#101F18] hover:bg-[#19352A] disabled:opacity-40 text-[#FDE68A] border border-[#D4AF37]/30 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={
                      isSpinning ||
                      slotState.freeSpinsRemaining > 0 ||
                      slotState.betPerLine >=
                        BET_PER_LINE_OPTIONS[BET_PER_LINE_OPTIONS.length - 1]
                    }
                    onClick={() => handleAdjustBetPerLine(1)}
                    aria-label="Increase bet per line"
                    className="w-10 h-10 rounded-lg bg-[#101F18] hover:bg-[#19352A] disabled:opacity-40 text-[#FDE68A] border border-[#D4AF37]/30 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total Bet Readout */}
              <div className="pl-1">
                <div className="text-[10px] uppercase tracking-widest text-[#A7B5AD]">
                  Total Bet
                </div>
                <div
                  data-testid="total-bet-readout"
                  className="font-mono text-sm sm:text-base font-bold text-[#FDE68A] tabular-nums"
                >
                  {slotState.freeSpinsRemaining > 0 ? 'FREE (3×)' : formatEuro(totalBet)}
                </div>
              </div>
            </div>

            {/* Right Group: Speed/Auto + Bet Max + Primary SPIN */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto sm:ml-auto">
              <button
                type="button"
                onClick={() => {
                  slotAudio.playClick();
                  setIsTurbo((t) => !t);
                }}
                aria-pressed={isTurbo}
                className={`h-11 px-3 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isTurbo
                    ? 'bg-[#F59E0B] text-[#0B1712] border-[#FEF3C7]'
                    : 'bg-[#101F18] text-[#CBD5E1] border-[#D4AF37]/30 hover:text-[#FAF6EE]'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Turbo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  slotAudio.playClick();
                  setIsAutoSpin((prev) => {
                    const next = !prev;
                    if (next && !isSpinning) {
                      window.setTimeout(() => triggerSpin(), 40);
                    }
                    return next;
                  });
                }}
                aria-pressed={isAutoSpin}
                className={`h-11 px-3 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isAutoSpin
                    ? 'bg-[#15803D] text-white border-[#86EFAC]'
                    : 'bg-[#101F18] text-[#CBD5E1] border-[#D4AF37]/30 hover:text-[#FAF6EE]'
                }`}
              >
                <Repeat className="w-4 h-4" />
                <span>{isAutoSpin ? 'Stop Auto' : 'Auto'}</span>
              </button>

              <button
                type="button"
                disabled={isSpinning || slotState.freeSpinsRemaining > 0}
                onClick={handleBetMax}
                className="h-11 px-4 rounded-lg bg-[#2A1B12] hover:bg-[#3F271A] disabled:opacity-40 text-[#FDE68A] font-semibold text-xs sm:text-sm border border-[#D4AF37]/50 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
              >
                Bet Max
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  data-testid="stop-button"
                  disabled={!isSpinning}
                  onClick={handleStopReels}
                  aria-label="Stop reels"
                  className="flex-1 sm:flex-initial h-12 px-5 rounded-lg bg-[#D97706] hover:bg-[#B45309] active:scale-[0.98] disabled:bg-[#1A120D] disabled:text-[#78716C] disabled:border-[#D4AF37]/25 disabled:opacity-65 text-[#0B1712] font-display font-bold text-sm sm:text-base tracking-wider border border-[#FEF3C7]/80 flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>STOP</span>
                </button>

                <button
                  type="button"
                  data-testid="spin-button"
                  disabled={isSpinning || !canAffordSpin(slotState)}
                  onClick={() => triggerSpin()}
                  className="flex-[1.6] sm:flex-initial h-12 px-7 sm:px-9 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] active:scale-[0.98] disabled:opacity-45 text-[#FAF6EE] font-display font-bold text-base sm:text-lg tracking-wider border border-[#FDE68A]/75 shadow-[0_6px_18px_rgba(0,0,0,0.45)] transition-all duration-150 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {slotState.freeSpinsRemaining > 0
                    ? `FREE SPIN (${slotState.freeSpinsRemaining})`
                    : 'SPIN'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Paytable & 20 Paylines Inspector Modal */}
      <PaytableModal
        isOpen={paytableOpen}
        betPerLine={slotState.betPerLine}
        activeLines={slotState.activeLines}
        progressiveJackpot={slotState.progressiveJackpot}
        onClose={() => setPaytableOpen(false)}
      />

      {/* Cloud Ledger & High-Roller Leaderboard Modal */}
      <CloudLedgerModal
        isOpen={ledgerOpen}
        user={user}
        recentSpins={recentSpins}
        leaderboard={leaderboard}
        authBusy={authBusy}
        onSignIn={() => void handleSignIn()}
        onClose={() => setLedgerOpen(false)}
      />

      {/* Pause & Game Over Modals */}
      {(gameState === 'paused' || gameState === 'gameover') && (
        <StatusModal
          mode={gameState}
          balance={slotState.balance}
          stats={slotState.stats}
          onResume={
            gameState === 'paused'
              ? () => {
                  slotAudio.playClick();
                  setGameState('playing');
                }
              : undefined
          }
          onResetBankroll={handleResetBankroll}
          onOpenPaytable={
            gameState === 'paused'
              ? () => {
                  slotAudio.playClick();
                  setPaytableOpen(true);
                }
              : undefined
          }
          onReturnTitle={() => {
            slotAudio.playClick();
            clearAllTimers();
            pendingSpinRef.current = null;
            setIsSpinning(false);
            setIsAutoSpin(false);
            setGameState('title');
          }}
        />
      )}
    </div>
  );
}
