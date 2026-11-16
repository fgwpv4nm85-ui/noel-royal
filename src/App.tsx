import React, { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  BookOpen,
  LogIn,
  LogOut,
  Minus,
  Music,
  Pause,
  Plus,
  Repeat,
  SlidersHorizontal,
  Square,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { CloudLedgerModal } from './components/CloudLedgerModal';
import { LanguageSelector } from './components/LanguageSelector';
import { PaylineOverlay } from './components/PaylineOverlay';
import { PaytableModal } from './components/PaytableModal';
import { SettingsModal } from './components/SettingsModal';
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
  PROGRESSIVE_SEED,
  SHOWCASE_GRID,
} from './game/constants';
import {
  canAffordSpin,
  createInitialSlotState,
  executeSpin,
  isGameOver,
  roundCurrency,
  spinReels,
} from './game/engine';
import {
  getTranslation,
  LANGUAGE_STORAGE_KEY,
  LanguageCode,
  resolveLanguage,
} from './game/i18n';
import {
  GameState,
  Grid,
  SlotMachineState,
  SpinResult,
  VolatilityMode,
} from './game/types';

const LEFT_PIN_IDS = Array.from({ length: 25 }, (_, i) => i + 1);
const RIGHT_PIN_IDS = Array.from({ length: 25 }, (_, i) => i + 26);
const VOLATILITY_STORAGE_KEY = 'noel_royale_volatility';

function getInitialVolatility(): VolatilityMode {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(VOLATILITY_STORAGE_KEY, 'rare');
    } catch {
      // Ignore storage access restrictions
    }
  }
  return 'rare';
}

function getInitialGameState(): GameState {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return 'playing';
    }
  }
  return 'title';
}

function getInitialLanguage(): LanguageCode {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored) {
        return resolveLanguage(stored);
      }
    } catch {
      // Ignore storage access restrictions
    }
    return resolveLanguage(window.navigator.language);
  }
  return 'en';
}

type StatusKind =
  | 'ready'
  | 'reset'
  | 'volatility'
  | 'signedOut'
  | 'signInCancelled'
  | 'result'
  | 'other';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState);
  const [language, setLanguage] = useState<LanguageCode>(getInitialLanguage);
  const [volatility, setVolatility] = useState<VolatilityMode>(getInitialVolatility);
  const [slotState, setSlotState] = useState<SlotMachineState>(() =>
    createInitialSlotState(PROGRESSIVE_SEED, getInitialVolatility()),
  );
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [recentSpins, setRecentSpins] = useState<CloudSpinEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [currentMusicThemeId, setCurrentMusicThemeId] = useState(() => slotAudio.getCurrentTheme().id);
  const [autoAlternateMusic, setAutoAlternateMusic] = useState(() => slotAudio.isAutoAlternate());
  const [isTurbo, setIsTurbo] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [hoveredLineId, setHoveredLineId] = useState<number | null>(null);
  const [pinnedLineId, setPinnedLineId] = useState<number | null>(null);
  const previewLineId = hoveredLineId ?? pinnedLineId;
  const [activeWinCycleIdx, setActiveWinCycleIdx] = useState(0);
  const [burstCounter, setBurstCounter] = useState(0);
  const [isBigBurst, setIsBigBurst] = useState(false);
  const [statusMessage, setStatusMessage] = useState(() =>
    getTranslation(getInitialLanguage()).cabinetReady,
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

  const languageRef = useRef<LanguageCode>(language);
  languageRef.current = language;

  const statusKindRef = useRef<StatusKind>('ready');

  const volatilityRef = useRef(volatility);
  volatilityRef.current = volatility;

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

  // Sync game state to body[data-state] and language to html[lang]
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Clear timers on unmount
  useEffect(() => clearAllTimers, [clearAllTimers]);

  // Sync active Christmas music theme when library alternates automatically
  useEffect(() => {
    return slotAudio.subscribeTheme((theme) => {
      setCurrentMusicThemeId(theme.id);
    });
  }, []);

  // Listen to Firebase Auth state & hydrate player's Firestore bankroll
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser) {
        try {
          const loaded = await loadOrCreatePlayerState(nextUser);
          setSlotState({ ...loaded, volatility: volatilityRef.current });
          statusKindRef.current = 'other';
          setStatusMessage(
            getTranslation(languageRef.current).cloudSyncedStatus(
              nextUser.displayName?.split(' ')[0] || 'Player',
            ),
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : '';
          if (msg.includes('Quota exceeded')) {
            statusKindRef.current = 'other';
            setStatusMessage(getTranslation(languageRef.current).quotaLocalStatus);
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
      statusKindRef.current = 'signInCancelled';
      setStatusMessage(getTranslation(languageRef.current).signInCancelledStatus);
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    slotAudio.playClick();
    setAuthBusy(true);
    try {
      await signOutUser();
      statusKindRef.current = 'signedOut';
      setStatusMessage(getTranslation(languageRef.current).signedOutStatus);
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
      setReelBlurGrid(spinReels(Math.random, volatilityRef.current));
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

  const formatResultSummary = useCallback((result: SpinResult, lang?: LanguageCode): string => {
    const dict = getTranslation(lang ?? languageRef.current);
    if (result.jackpotWon > 0) {
      return dict.jackpotWonSummary(formatEuro(result.totalWin));
    }
    if (result.freeSpinsAwarded > 0) {
      return dict.freeSpinsWonSummary(
        result.scatterCount,
        result.freeSpinsAwarded,
        formatEuro(result.totalWin),
      );
    }
    if (result.winningLines.length === 1) {
      const w = result.winningLines[0];
      const symName = dict.symbols[w.symbolId] ?? w.symbolId;
      return dict.singleLineWinSummary(
        w.lineName,
        w.matchCount,
        symName,
        w.usedWild,
        w.appliedMultiplier,
        formatEuro(result.totalWin),
      );
    }
    if (result.winningLines.length > 1) {
      return dict.multiLineWinSummary(
        result.winningLines.length,
        result.multiplierApplied,
        formatEuro(result.totalWin),
      );
    }
    if (result.scatterCount === 2) {
      return dict.twoScattersHint;
    }
    return dict.noWinStatus;
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
      statusKindRef.current = 'result';
      setStatusMessage(summaryText);

      if (userRef.current) {
        void saveSpinOutcome(userRef.current, nextState, result, summaryText).catch((err) => {
          const msg = err instanceof Error ? err.message : '';
          if (msg.includes('Quota exceeded')) {
            statusKindRef.current = 'other';
            setStatusMessage(getTranslation(languageRef.current).quotaSpinLocalStatus);
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
          statusKindRef.current = 'other';
          setStatusMessage(getTranslation(languageRef.current).insufficientBalance);
        }
        return;
      }

      clearAllTimers();
      setHoveredLineId(null);
      setPinnedLineId(null);
      setActiveWinCycleIdx(0);
      setIsSpinning(true);
      setSpinningReels([true, true, true, true, true]);
      setSettledReels([false, false, false, false, false]);

      const { nextState, result } = executeSpin(
        current,
        undefined,
        Math.random,
        volatilityRef.current,
      );
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

      const dict = getTranslation(languageRef.current);
      statusKindRef.current = 'other';
      setStatusMessage(
        isFree
          ? dict.spinningFreeStatus(Math.max(0, current.freeSpinsRemaining - 1))
          : dict.spinningReelsStatus(formatEuro(wagerThisSpin)),
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
    slotAudio.startMusicIfEnabled();
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
      ...createInitialSlotState(slotStateRef.current.progressiveJackpot, volatilityRef.current),
      stats: slotStateRef.current.stats,
    };
    setSlotState(fresh);
    setDisplayGrid(SHOWCASE_GRID);
    statusKindRef.current = 'reset';
    setStatusMessage(getTranslation(languageRef.current).bankrollResetStatus);
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
      activeLines: PAYLINES.length,
      betPerLine: 25.0,
    };
    setSlotState(maxState);
    if (canAffordSpin(maxState)) {
      triggerSpin(maxState);
    } else {
      statusKindRef.current = 'other';
      setStatusMessage(getTranslation(languageRef.current).balanceBelowMaxBet);
    }
  }, [isSpinning, slotState, triggerSpin]);

  const handleAdjustLines = (delta: number) => {
    if (isSpinning || slotState.freeSpinsRemaining > 0) return;
    slotAudio.playClick();
    setSlotState((prev) => {
      const next = {
        ...prev,
        activeLines: Math.max(1, Math.min(PAYLINES.length, prev.activeLines + delta)),
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

  const toggleMusic = useCallback(() => {
    setIsMusicOn((prev) => {
      const next = !prev;
      slotAudio.setMusicEnabled(next);
      return next;
    });
  }, []);

  const handleSelectMusicTheme = useCallback((themeId: string) => {
    slotAudio.playClick();
    slotAudio.selectTheme(themeId);
    setCurrentMusicThemeId(slotAudio.getCurrentTheme().id);
  }, []);

  const handleNextMusicTheme = useCallback(() => {
    slotAudio.playClick();
    slotAudio.nextTheme();
    setCurrentMusicThemeId(slotAudio.getCurrentTheme().id);
  }, []);

  const handleToggleAutoAlternateMusic = useCallback(() => {
    slotAudio.playClick();
    setAutoAlternateMusic((prev) => {
      const next = !prev;
      slotAudio.setAutoAlternate(next);
      return next;
    });
  }, []);

  const handleChangeVolatility = useCallback((mode: VolatilityMode) => {
    slotAudio.playClick();
    setVolatility(mode);
    volatilityRef.current = mode;
    setSlotState((prev) => ({ ...prev, volatility: mode }));
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(VOLATILITY_STORAGE_KEY, mode);
      } catch {
        // Ignore storage errors
      }
    }
    statusKindRef.current = 'volatility';
    setStatusMessage(getTranslation(languageRef.current).volatilityStatus);
  }, []);

  const handleChangeLanguage = useCallback(
    (nextLang: LanguageCode) => {
      slotAudio.playClick();
      setLanguage(nextLang);
      languageRef.current = nextLang;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
        } catch {
          // Ignore storage errors
        }
      }
      if (!isSpinningRef.current) {
        const nextDict = getTranslation(nextLang);
        const kind = statusKindRef.current;
        if (kind === 'result' && slotStateRef.current.lastResult) {
          setStatusMessage(formatResultSummary(slotStateRef.current.lastResult, nextLang));
        } else if (kind === 'reset') {
          setStatusMessage(nextDict.bankrollResetStatus);
        } else if (kind === 'volatility') {
          setStatusMessage(nextDict.volatilityStatus);
        } else if (kind === 'signedOut') {
          setStatusMessage(nextDict.signedOutStatus);
        } else if (kind === 'signInCancelled') {
          setStatusMessage(nextDict.signInCancelledStatus);
        } else if (kind === 'ready') {
          setStatusMessage(nextDict.cabinetReady);
        }
      }
    },
    [formatResultSummary],
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (paytableOpen || ledgerOpen || settingsOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setPaytableOpen(false);
          setLedgerOpen(false);
          setSettingsOpen(false);
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
    settingsOpen,
    handleStartGame,
    handleResetBankroll,
    handleStopReels,
    triggerSpin,
    toggleMute,
    handleBetMax,
  ]);

  const t = getTranslation(language);
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
        paused={
          paytableOpen ||
          ledgerOpen ||
          settingsOpen ||
          gameState === 'paused' ||
          gameState === 'gameover'
        }
      />

      {gameState === 'title' ? (
        <TitleScreen
          language={language}
          onChangeLanguage={handleChangeLanguage}
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
        <div className="relative z-10 flex-1 flex flex-col justify-between max-w-6xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-4 gap-2.5 sm:gap-3">
          {/* Perimeter Top HUD */}
          <header className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-2.5 rounded-xl bg-[#19110C]/95 border border-[#D4AF37]/40 shadow-lg">
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

            {/* Free Spins Badge (when active) */}
            {slotState.freeSpinsRemaining > 0 && (
              <div className="px-3 py-1 rounded-md bg-[#B91C1C] border border-[#FDE68A]/70 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[#FEF3C7]">
                  {t.freeSpinsBadge}
                </span>
                <span
                  data-testid="freespins-readout"
                  className="font-mono text-base font-bold text-white tabular-nums"
                >
                  {slotState.freeSpinsRemaining}
                </span>
              </div>
            )}

            {/* Utility Controls */}
            <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  slotAudio.playClick();
                  setLedgerOpen(true);
                }}
                aria-label={t.ledgerTitle}
                title={t.ledgerTitle}
                className="h-9 sm:h-10 w-8 sm:w-auto sm:min-w-[40px] px-0 sm:px-3 rounded-lg bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border border-[#D4AF37]/35 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">{t.ledger}</span>
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
                  aria-label={t.signOut}
                  title={user.displayName || user.email || t.signOut}
                  className="h-9 sm:h-10 w-8 sm:w-auto sm:min-w-[40px] px-0 sm:px-3 rounded-lg bg-[#101F18] hover:bg-[#19352A] disabled:opacity-50 text-[#E2DDD3] border border-[#D4AF37]/35 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">
                    {user.displayName ? user.displayName.split(' ')[0] : t.signOut}
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
                  aria-label={t.signInWithGoogle}
                  title={t.signInToSave}
                  className="h-9 sm:h-10 w-8 sm:w-auto sm:min-w-[40px] px-0 sm:px-3 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] disabled:opacity-50 text-[#FAF6EE] border border-[#FDE68A]/50 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden md:inline">
                    {authBusy ? t.signingIn : t.signIn}
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
                aria-label={t.paytable}
                title={`${t.paytable} [P]`}
                className="h-9 sm:h-10 w-8 sm:w-auto sm:min-w-[40px] px-0 sm:px-3 rounded-lg bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border border-[#D4AF37]/35 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{t.paytable}</span>
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="music-toggle-button"
                aria-pressed={isMusicOn}
                onClick={(e) => {
                  e.currentTarget.blur();
                  toggleMusic();
                }}
                aria-label={`${t.music} ${isMusicOn ? 'ON' : 'OFF'}`}
                title={
                  isMusicOn
                    ? `${t.music} ON · ${slotAudio.getThemes().find((th) => th.id === currentMusicThemeId)?.title ?? 'Noël'}`
                    : `${t.music} OFF`
                }
                className={`h-9 sm:h-10 w-8 sm:w-auto sm:min-w-[40px] px-0 lg:px-3 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isMusicOn
                    ? 'bg-[#19352A] hover:bg-[#224739] text-[#FDE047] border-[#F59E0B]/60'
                    : 'bg-[#1A120D] hover:bg-[#2B1810] text-[#78716C] border-[#D4AF37]/25'
                }`}
              >
                <Music className="w-4 h-4" />
                <span className="hidden lg:inline">{t.music}</span>
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="sfx-toggle-button"
                aria-pressed={!isMuted}
                onClick={(e) => {
                  e.currentTarget.blur();
                  toggleMute();
                }}
                aria-label={`${t.sfx} ${isMuted ? 'OFF' : 'ON'}`}
                title={`${t.sfx} ${isMuted ? 'OFF' : 'ON'} [M]`}
                className={`h-9 sm:h-10 w-8 sm:w-auto sm:min-w-[40px] px-0 lg:px-3 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  !isMuted
                    ? 'bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border-[#D4AF37]/35'
                    : 'bg-[#1A120D] hover:bg-[#2B1810] text-[#78716C] border-[#D4AF37]/25'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden lg:inline">{t.sfx}</span>
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="settings-button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  slotAudio.playClick();
                  setSettingsOpen(true);
                }}
                aria-label={t.settings}
                title={t.settingsTitle}
                className="h-9 sm:h-10 w-8 sm:w-auto sm:min-w-[40px] px-0 lg:px-3 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border-[#D4AF37]/35"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden lg:inline">{t.settings}</span>
              </button>

              <LanguageSelector
                language={language}
                onChangeLanguage={handleChangeLanguage}
                variant="header"
              />

              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setIsAutoSpin(false);
                  setGameState('paused');
                }}
                aria-label={t.pause}
                title={`${t.pause} [Esc]`}
                className="w-8 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border border-[#D4AF37]/35 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Pinned Telemetry Bar: Balance (Left) · Lot Progressif (Center) · Last Win (Right) */}
          <div
            data-testid="telemetry-row"
            className="sticky top-2 z-20 grid grid-cols-2 sm:grid-cols-[1fr_minmax(320px,1.4fr)_1fr] gap-2 sm:gap-3 items-stretch"
          >
            {/* Balance Box (Left) */}
            <section
              aria-label={t.balance}
              data-testid="balance-box"
              className="order-1 px-3.5 sm:px-4 py-2 rounded-xl bg-[#19110C]/95 border border-[#D4AF37]/45 shadow-lg backdrop-blur-sm flex flex-col justify-center"
            >
              <div className="text-[10px] uppercase tracking-widest text-[#A7B5AD]">
                {t.balance}
              </div>
              <div
                data-testid="balance-readout"
                className="font-mono text-base sm:text-xl font-bold text-[#FAF6EE] tabular-nums whitespace-nowrap"
              >
                {formatEuro(slotState.balance)}
              </div>
            </section>

            {/* Standalone Lot Progressif Box (Center) */}
            <section
              aria-label={t.progressiveJackpot}
              data-testid="jackpot-box"
              className="order-3 col-span-2 sm:order-2 sm:col-span-1 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#19110C]/95 via-[#2B1810]/95 to-[#19110C]/95 border border-[#F59E0B]/70 shadow-[0_8px_24px_rgba(0,0,0,0.55)] backdrop-blur-sm flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#19110C] border border-[#FDE68A]/45 flex items-center justify-center shrink-0 text-[#FDE047]">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FDE68A] truncate">
                    {t.progressiveJackpot}
                  </div>
                  <div className="text-[11px] text-[#D6D0C4] truncate hidden lg:block">
                    {t.jackpotSubtitle}
                  </div>
                </div>
              </div>
              <div
                data-testid="jackpot-readout"
                className="font-mono text-xl sm:text-2xl font-bold text-[#FDE047] tabular-nums whitespace-nowrap shrink-0"
              >
                {formatEuro(slotState.progressiveJackpot)}
              </div>
            </section>

            {/* Last Win Box (Right) */}
            <section
              aria-label={t.lastWin}
              data-testid="last-win-box"
              className="order-2 sm:order-3 px-3.5 sm:px-4 py-2 rounded-xl bg-[#19110C]/95 border border-[#D4AF37]/45 shadow-lg backdrop-blur-sm flex flex-col justify-center items-end"
            >
              <div className="text-[10px] uppercase tracking-widest text-[#A7B5AD]">
                {t.lastWin}
              </div>
              <div
                data-testid="win-readout"
                className={`font-mono text-base sm:text-xl font-bold tabular-nums whitespace-nowrap ${
                  lastWin > 0 ? 'text-[#FDE047]' : 'text-[#CBD5E1]'
                }`}
              >
                {formatEuro(lastWin)}
              </div>
            </section>
          </div>

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
                {/* Left Payline Pins (1–25) */}
                <div
                  className="hidden md:grid grid-cols-2 gap-1 py-0.5 content-between shrink-0"
                  aria-label="Paylines 1 to 25"
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
                        onMouseEnter={() => setHoveredLineId(id)}
                        onMouseLeave={() => setHoveredLineId((curr) => (curr === id ? null : curr))}
                        onClick={() =>
                          setPinnedLineId((curr) => (curr === id ? null : id))
                        }
                        aria-label={`Preview ${line.name}`}
                        className={`w-6 h-[22px] rounded text-[10px] font-mono font-bold tabular-nums transition-transform cursor-pointer border ${
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
                  data-spinning={isSpinning ? 'true' : 'false'}
                  className={`relative flex-1 grid grid-cols-5 gap-1.5 sm:gap-2.5 p-2 sm:p-3 rounded-xl bg-[#0D1914] border border-[#D4AF37]/40 overflow-hidden transition-transform duration-200 ease-out ${
                    isSpinning ? 'animate-reel-tilt' : ''
                  }`}
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
                                label={t.symbols[symId]}
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

                {/* Right Payline Pins (26–50) */}
                <div
                  className="hidden md:grid grid-cols-2 gap-1 py-0.5 content-between shrink-0"
                  aria-label="Paylines 26 to 50"
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
                        onMouseEnter={() => setHoveredLineId(id)}
                        onMouseLeave={() => setHoveredLineId((curr) => (curr === id ? null : curr))}
                        onClick={() =>
                          setPinnedLineId((curr) => (curr === id ? null : id))
                        }
                        aria-label={`Preview ${line.name}`}
                        className={`w-6 h-[22px] rounded text-[10px] font-mono font-bold tabular-nums transition-transform cursor-pointer border ${
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
                    {t.lineCycleCounter(
                      (activeWinCycleIdx % winningLines.length) + 1,
                      winningLines.length,
                    )}
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
                    {t.lines}
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
                    aria-label={t.decreaseLinesAria}
                    className="w-10 h-10 rounded-lg bg-[#101F18] hover:bg-[#19352A] disabled:opacity-40 text-[#FDE68A] border border-[#D4AF37]/30 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isSpinning || slotState.freeSpinsRemaining > 0 || slotState.activeLines >= PAYLINES.length}
                    onClick={() => handleAdjustLines(1)}
                    aria-label={t.increaseLinesAria}
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
                    {t.betPerLine}
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
                    aria-label={t.decreaseBetAria}
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
                    aria-label={t.increaseBetAria}
                    className="w-10 h-10 rounded-lg bg-[#101F18] hover:bg-[#19352A] disabled:opacity-40 text-[#FDE68A] border border-[#D4AF37]/30 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total Bet Readout */}
              <div className="pl-1">
                <div className="text-[10px] uppercase tracking-widest text-[#A7B5AD]">
                  {t.totalBet}
                </div>
                <div
                  data-testid="total-bet-readout"
                  className="font-mono text-sm sm:text-base font-bold text-[#FDE68A] tabular-nums"
                >
                  {slotState.freeSpinsRemaining > 0 ? t.freeMultiplierTag : formatEuro(totalBet)}
                </div>
              </div>
            </div>

            {/* Right Group: Speed/Auto + Bet Max + Primary SPIN */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto sm:ml-auto">
              <button
                type="button"
                onClick={() => {
                  slotAudio.playClick();
                  setIsTurbo((prev) => !prev);
                }}
                aria-pressed={isTurbo}
                className={`h-11 px-3 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isTurbo
                    ? 'bg-[#F59E0B] text-[#0B1712] border-[#FEF3C7]'
                    : 'bg-[#101F18] text-[#CBD5E1] border-[#D4AF37]/30 hover:text-[#FAF6EE]'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{t.turbo}</span>
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
                <span>{isAutoSpin ? t.stopAuto : t.auto}</span>
              </button>

              <button
                type="button"
                disabled={isSpinning || slotState.freeSpinsRemaining > 0}
                onClick={handleBetMax}
                className="h-11 px-4 rounded-lg bg-[#2A1B12] hover:bg-[#3F271A] disabled:opacity-40 text-[#FDE68A] font-semibold text-xs sm:text-sm border border-[#D4AF37]/50 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
              >
                {t.betMax}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  data-testid="stop-button"
                  disabled={!isSpinning}
                  onClick={handleStopReels}
                  aria-label={t.stopReelsAria}
                  className="flex-1 sm:flex-initial h-12 px-5 rounded-lg bg-[#D97706] hover:bg-[#B45309] active:scale-[0.98] disabled:bg-[#1A120D] disabled:text-[#78716C] disabled:border-[#D4AF37]/25 disabled:opacity-65 text-[#0B1712] font-display font-bold text-sm sm:text-base tracking-wider border border-[#FEF3C7]/80 flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{t.stop}</span>
                </button>

                <button
                  type="button"
                  data-testid="spin-button"
                  disabled={isSpinning || !canAffordSpin(slotState)}
                  onClick={() => triggerSpin()}
                  className="flex-[1.6] sm:flex-initial h-12 px-7 sm:px-9 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] active:scale-[0.98] disabled:opacity-45 text-[#FAF6EE] font-display font-bold text-base sm:text-lg tracking-wider border border-[#FDE68A]/75 shadow-[0_6px_18px_rgba(0,0,0,0.45)] transition-all duration-150 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {slotState.freeSpinsRemaining > 0
                    ? t.freeSpinCount(slotState.freeSpinsRemaining)
                    : t.spin}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Paytable & 50 Paylines Inspector Modal */}
      <PaytableModal
        isOpen={paytableOpen}
        language={language}
        betPerLine={slotState.betPerLine}
        activeLines={slotState.activeLines}
        progressiveJackpot={slotState.progressiveJackpot}
        onClose={() => setPaytableOpen(false)}
      />

      {/* Cloud Ledger & High-Roller Leaderboard Modal */}
      <CloudLedgerModal
        isOpen={ledgerOpen}
        language={language}
        user={user}
        recentSpins={recentSpins}
        leaderboard={leaderboard}
        authBusy={authBusy}
        onSignIn={() => void handleSignIn()}
        onClose={() => setLedgerOpen(false)}
      />

      {/* Cabinet Settings Modal (Language, Volatility, Audio, Music Library, Speed) */}
      <SettingsModal
        isOpen={settingsOpen}
        language={language}
        volatility={volatility}
        isSpinning={isSpinning}
        isMusicOn={isMusicOn}
        isMuted={isMuted}
        isTurbo={isTurbo}
        musicThemes={slotAudio.getThemes()}
        currentThemeId={currentMusicThemeId}
        autoAlternateMusic={autoAlternateMusic}
        onChangeLanguage={handleChangeLanguage}
        onChangeVolatility={handleChangeVolatility}
        onToggleMusic={toggleMusic}
        onToggleMute={toggleMute}
        onToggleTurbo={() => {
          slotAudio.playClick();
          setIsTurbo((prev) => !prev);
        }}
        onSelectMusicTheme={handleSelectMusicTheme}
        onNextMusicTheme={handleNextMusicTheme}
        onToggleAutoAlternateMusic={handleToggleAutoAlternateMusic}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Pause & Game Over Modals */}
      {(gameState === 'paused' || gameState === 'gameover') && (
        <StatusModal
          mode={gameState}
          language={language}
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
          onOpenSettings={
            gameState === 'paused'
              ? () => {
                  slotAudio.playClick();
                  setSettingsOpen(true);
                }
              : undefined
          }
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
