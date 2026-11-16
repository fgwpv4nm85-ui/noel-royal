import { SymbolId } from './types';

export type LanguageCode = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt';

export interface LanguageOption {
  code: LanguageCode;
  shortLabel: string;
  nativeName: string;
}

export const AVAILABLE_LANGUAGES: readonly LanguageOption[] = [
  { code: 'fr', shortLabel: 'FR', nativeName: 'Français' },
  { code: 'en', shortLabel: 'EN', nativeName: 'English' },
  { code: 'es', shortLabel: 'ES', nativeName: 'Español' },
  { code: 'de', shortLabel: 'DE', nativeName: 'Deutsch' },
  { code: 'it', shortLabel: 'IT', nativeName: 'Italiano' },
  { code: 'pt', shortLabel: 'PT', nativeName: 'Português' },
] as const;

export const LANGUAGE_STORAGE_KEY = 'noel_royale_language';

export function resolveLanguage(candidate?: string | null): LanguageCode {
  if (!candidate) return 'en';
  const normalized = candidate.trim().toLowerCase().slice(0, 2);
  const match = AVAILABLE_LANGUAGES.find((l) => l.code === normalized);
  return match ? match.code : 'en';
}

export interface TranslationDict {
  languageLabel: string;
  chooseLanguageAria: string;
  // Header & HUD
  ledger: string;
  signIn: string;
  signingIn: string;
  signOut: string;
  paytable: string;
  music: string;
  sfx: string;
  settings: string;
  pause: string;
  balance: string;
  lastWin: string;
  progressiveJackpot: string;
  jackpotSubtitle: string;
  freeSpinsBadge: string;
  // Controls & Cabinet
  lines: string;
  betPerLine: string;
  totalBet: string;
  freeMultiplierTag: string;
  turbo: string;
  auto: string;
  stopAuto: string;
  betMax: string;
  stop: string;
  spin: string;
  freeSpinCount: (remaining: number) => string;
  decreaseLinesAria: string;
  increaseLinesAria: string;
  decreaseBetAria: string;
  increaseBetAria: string;
  stopReelsAria: string;
  lineCycleCounter: (index: number, total: number) => string;
  // Status & Result Messages
  cabinetReady: string;
  bankrollResetStatus: string;
  insufficientBalance: string;
  balanceBelowMaxBet: string;
  spinningFreeStatus: (remaining: number) => string;
  spinningReelsStatus: (wager: string) => string;
  cloudSyncedStatus: (name: string) => string;
  signedOutStatus: string;
  signInCancelledStatus: string;
  quotaLocalStatus: string;
  quotaSpinLocalStatus: string;
  jackpotWonSummary: (totalWin: string) => string;
  freeSpinsWonSummary: (scatters: number, awarded: number, totalWin: string) => string;
  singleLineWinSummary: (
    lineName: string,
    count: number,
    symbolName: string,
    usedWild: boolean,
    multiplier: number,
    totalWin: string,
  ) => string;
  multiLineWinSummary: (lineCount: number, multiplier: number, totalWin: string) => string;
  twoScattersHint: string;
  noWinStatus: string;
  volatilityStatus: string;
  // Title Screen
  titleSubtitle: string;
  titleDescription: string;
  play: string;
  signInToSave: string;
  titleFooterHints: string;
  // Paytable Modal
  paytableTitle: string;
  paytableStakeLine: (betPerLine: string, activeLines: number, totalBet: string) => string;
  closePaytableAria: string;
  jackpotBannerTitle: string;
  jackpotBannerDesc: (seed: string) => string;
  currentJackpot: string;
  wildRuleTitle: string;
  wildRuleDesc: string;
  scatterRuleTitle: string;
  scatterRuleDesc: string;
  symbolPayoutsHeading: string;
  multipliesTotalBet: string;
  multipliesBetPerLine: string;
  paylinesHeading: string;
  inspectingLabel: string;
  // Settings Modal
  settingsTitle: string;
  settingsSubtitle: string;
  closeSettingsAria: string;
  volatilityHeading: string;
  higherVariance: string;
  rareBigWins: string;
  rareBigWinsDesc: string;
  audioAndSpeed: string;
  musicLibraryTitle: (count: number) => string;
  alternance: string;
  nextTrack: string;
  activeTrack: string;
  done: string;
  // Cloud Ledger Modal
  ledgerTitle: string;
  ledgerCloudSynced: (name: string) => string;
  ledgerSignInPrompt: string;
  closeLedgerAria: string;
  hallOfFame: string;
  spinHistory: string;
  signInWithGoogle: string;
  noLeaderboardYet: string;
  youTag: string;
  spinsSummaryLine: (spins: number, peak: string) => string;
  bestWin: string;
  signInHistoryPrompt: string;
  noCloudSpinsYet: string;
  freeSpinTag: string;
  betTag: (amount: string) => string;
  linesTag: (count: number) => string;
  // Status Modal (Pause / Game Over)
  outOfCredits: string;
  cabinetPaused: string;
  outOfCreditsDesc: string;
  pausedDesc: string;
  spinsLabel: string;
  resume: string;
  playAgain: string;
  resetBankroll: string;
  cabinetSettingsMenu: string;
  paytableMenu: string;
  titleScreenMenu: string;
  // Symbols
  symbols: Record<SymbolId, string>;
}

const FR: TranslationDict = {
  languageLabel: 'Langue',
  chooseLanguageAria: 'Changer de langue',
  ledger: 'Classement',
  signIn: 'Connexion',
  signingIn: 'Connexion...',
  signOut: 'Déconnexion',
  paytable: 'Gains',
  music: 'Musique',
  sfx: 'Effets',
  settings: 'Réglages',
  pause: 'Pause',
  balance: 'Solde',
  lastWin: 'Dernier gain',
  progressiveJackpot: 'Lot Progressif',
  jackpotSubtitle: '5× Père Noël (WILD) · +2% par tour',
  freeSpinsBadge: 'Tours Gratuits · 3×',
  lines: 'Lignes',
  betPerLine: 'Mise / Ligne',
  totalBet: 'Mise Totale',
  freeMultiplierTag: 'GRATUIT (3×)',
  turbo: 'Turbo',
  auto: 'Auto',
  stopAuto: 'Stop Auto',
  betMax: 'Mise Max',
  stop: 'STOP',
  spin: 'JOUER',
  freeSpinCount: (remaining) => `TOUR GRATUIT (${remaining})`,
  decreaseLinesAria: 'Diminuer les lignes actives',
  increaseLinesAria: 'Augmenter les lignes actives',
  decreaseBetAria: 'Diminuer la mise par ligne',
  increaseBetAria: 'Augmenter la mise par ligne',
  stopReelsAria: 'Arrêter les rouleaux',
  lineCycleCounter: (index, total) => `Ligne ${index}/${total}`,
  cabinetReady: 'Machine prête · Alignez 3+ symboles de gauche à droite sur 50 lignes',
  bankrollResetStatus: 'Solde réinitialisé à 2 500.00 € · Prêt à jouer',
  insufficientBalance: 'Solde insuffisant pour cette mise — réduisez la mise ou réinitialisez.',
  balanceBelowMaxBet: 'Solde inférieur à la Mise Max de 1 250.00 € — baissez la mise/ligne.',
  spinningFreeStatus: (remaining) => `Tour Gratuit actif (3×) · ${remaining} restant(s)...`,
  spinningReelsStatus: (wager) => `Rotation des 5 rouleaux · Mise ${wager}...`,
  cloudSyncedStatus: (name) => `Cloud synchronisé · Bon retour, ${name}`,
  signedOutStatus: 'Déconnecté — session locale active.',
  signInCancelledStatus: 'Connexion annulée — session locale maintenue.',
  quotaLocalStatus: 'Quota Firestore atteint — mode local actif.',
  quotaSpinLocalStatus: 'Quota Firestore atteint — tour conservé localement.',
  jackpotWonSummary: (totalWin) =>
    `LOT PROGRESSIF REMPORTÉ ! 5× Père Noël (WILD) · +${totalWin} !`,
  freeSpinsWonSummary: (scatters, awarded, totalWin) =>
    `Bonus Étoile Polaire ! ${scatters}× Scatters → ${awarded} Tours Gratuits (3×) · +${totalWin}`,
  singleLineWinSummary: (lineName, count, symbolName, usedWild, multiplier, totalWin) =>
    `${lineName} : ${count}× ${symbolName}${usedWild ? ' (avec Wild)' : ''}${
      multiplier > 1 ? ` · ${multiplier}× Tour Gratuit` : ''
    } · +${totalWin}`,
  multiLineWinSummary: (lineCount, multiplier, totalWin) =>
    `${lineCount} lignes gagnantes${multiplier > 1 ? ` (${multiplier}× Tour Gratuit)` : ''} · Gain total +${totalWin}`,
  twoScattersHint: '2× Étoiles Polaires — encore 1 pour déclencher les Tours Gratuits 3× !',
  noWinStatus: 'Aucune ligne gagnante — tentez encore votre chance !',
  volatilityStatus: 'Volatilité : Rare Big Wins (Variance élevée)',
  titleSubtitle: 'CABINET ALPIN 5×3 · 50 LIGNES',
  titleDescription:
    'Faites tourner cinq rouleaux d’acajou et de laiton. Alignez les trésors de Noël sur 50 lignes, profitez du Père Noël Wild et obtenez 3+ Étoiles Polaires pour des Tours Gratuits 3×.',
  play: 'Jouer',
  signInToSave: 'Connexion pour sauvegarder',
  titleFooterHints: 'Entrée ou Espace Jouer · Espace Tourner · P Gains · M Muet · Échap Pause',
  paytableTitle: 'Table des Gains & 50 Lignes',
  paytableStakeLine: (betPerLine, activeLines, totalBet) =>
    `Gains affichés pour : ${betPerLine} / ligne · ${activeLines} lignes (${totalBet} total)`,
  closePaytableAria: 'Fermer la table des gains',
  jackpotBannerTitle: 'Lot Progressif Noël Royale',
  jackpotBannerDesc: (seed) =>
    `Chaque tour ajoute 2% (min 0.10 €). Alignez 5× Père Noël (WILD) sur une ligne active pour gagner toute la cagnotte + 1 000× la mise/ligne ! Réinitialisé à ${seed}.`,
  currentJackpot: 'Cagnotte actuelle',
  wildRuleTitle: 'Père Noël · WILD',
  wildRuleDesc:
    'Remplace tous les symboles sauf le Scatter. 5× sur une ligne active remporte le Lot Progressif !',
  scatterRuleTitle: 'Étoile Polaire · SCATTER',
  scatterRuleDesc:
    '3+ Scatters n’importe où offrent 10 / 15 / 25 Tours Gratuits avec un multiplicateur 3× sur tous les gains.',
  symbolPayoutsHeading: 'Gains par Symbole',
  multipliesTotalBet: 'Multiplie la Mise Totale',
  multipliesBetPerLine: 'Multiplie la Mise / Ligne',
  paylinesHeading: '50 Tracés de Lignes (Gauche à Droite)',
  inspectingLabel: 'Aperçu :',
  settingsTitle: 'Réglages de la Machine',
  settingsSubtitle: 'Configurez la langue, la volatilité, la bibliothèque musicale et la vitesse',
  closeSettingsAria: 'Fermer les réglages',
  volatilityHeading: 'Volatilité',
  higherVariance: 'Variance élevée',
  rareBigWins: 'Rare Big Wins',
  rareBigWinsDesc:
    'Variance élevée · Moins de touches mais gains 4×/5× boostés (1.75× / 2.5×) et +3 Tours Gratuits bonus.',
  audioAndSpeed: 'Audio & Vitesse',
  musicLibraryTitle: (count) => `Bibliothèque Musicale (${count})`,
  alternance: 'Alternance',
  nextTrack: 'Suivant',
  activeTrack: 'Actif',
  done: 'Terminer',
  ledgerTitle: 'Journal Cloud & Panthéon',
  ledgerCloudSynced: (name) => `Synchronisé sur le cloud en tant que ${name}`,
  ledgerSignInPrompt: 'Connectez-vous avec Google pour sauvegarder votre solde et historique',
  closeLedgerAria: 'Fermer le journal',
  hallOfFame: 'Panthéon',
  spinHistory: 'Historique',
  signInWithGoogle: 'Connexion Google',
  noLeaderboardYet: 'Aucun record enregistré. Connectez-vous et jouez pour ouvrir le classement !',
  youTag: '(Vous)',
  spinsSummaryLine: (spins, peak) => `${spins} tours · Record ${peak}`,
  bestWin: 'Meilleur gain',
  signInHistoryPrompt:
    'Connectez-vous avec Google pour enregistrer vos 2 500.00 € et consulter votre historique cloud.',
  noCloudSpinsYet: 'Aucun tour enregistré dans le cloud pour le moment.',
  freeSpinTag: 'Tour Gratuit (3×)',
  betTag: (amount) => `Mise ${amount}`,
  linesTag: (count) => `${count} lignes`,
  outOfCredits: 'Crédits Épuisés',
  cabinetPaused: 'Jeu en Pause',
  outOfCreditsDesc: 'Votre solde est inférieur à la mise minimale de 0.10 €.',
  pausedDesc: 'Consultez votre session ou ajustez les réglages de la machine.',
  spinsLabel: 'Tours',
  resume: 'Reprendre',
  playAgain: 'Rejouer (2 500.00 €)',
  resetBankroll: 'Réinitialiser le solde (2 500.00 €)',
  cabinetSettingsMenu: 'Réglages & Volatilité',
  paytableMenu: 'Table des Gains & 50 Lignes',
  titleScreenMenu: 'Écran Titre',
  symbols: {
    WILD: 'Père Noël',
    SCATTER: 'Étoile Polaire',
    TREE: 'Sapin de Noël',
    BELL: "Cloche d'Or",
    GIFT: 'Cadeau Magique',
    REINDEER: 'Renne Polaire',
    SNOWMAN: 'Bonhomme de Neige',
    STOCKING: 'Chaussette',
    CANDY: "Sucre d'Orge",
  },
};

const EN: TranslationDict = {
  languageLabel: 'Language',
  chooseLanguageAria: 'Change language',
  ledger: 'Ledger',
  signIn: 'Sign in',
  signingIn: 'Signing in...',
  signOut: 'Sign out',
  paytable: 'Paytable',
  music: 'Music',
  sfx: 'SFX',
  settings: 'Settings',
  pause: 'Pause',
  balance: 'Balance',
  lastWin: 'Last Win',
  progressiveJackpot: 'Lot Progressif',
  jackpotSubtitle: '5× Père Noël (WILD) · +2% per spin',
  freeSpinsBadge: 'Free Spins · 3×',
  lines: 'Lines',
  betPerLine: 'Bet / Line',
  totalBet: 'Total Bet',
  freeMultiplierTag: 'FREE (3×)',
  turbo: 'Turbo',
  auto: 'Auto',
  stopAuto: 'Stop Auto',
  betMax: 'Bet Max',
  stop: 'STOP',
  spin: 'SPIN',
  freeSpinCount: (remaining) => `FREE SPIN (${remaining})`,
  decreaseLinesAria: 'Decrease active lines',
  increaseLinesAria: 'Increase active lines',
  decreaseBetAria: 'Decrease bet per line',
  increaseBetAria: 'Increase bet per line',
  stopReelsAria: 'Stop reels',
  lineCycleCounter: (index, total) => `Line ${index}/${total}`,
  cabinetReady: 'Cabinet ready · Match 3+ symbols left to right on 50 paylines',
  bankrollResetStatus: 'Bankroll reset to 2 500.00 € · Ready to spin',
  insufficientBalance: 'Insufficient balance for current bet — lower bet/lines or reset bankroll.',
  balanceBelowMaxBet: 'Balance below 1 250.00 € Max Bet — lower bet/line to spin.',
  spinningFreeStatus: (remaining) => `Free Spin active (3× Multiplier) · ${remaining} remaining...`,
  spinningReelsStatus: (wager) => `Spinning 5 reels · Bet ${wager}...`,
  cloudSyncedStatus: (name) => `Cloud ledger synced · Welcome back, ${name}`,
  signedOutStatus: 'Signed out — playing in local session mode.',
  signInCancelledStatus: 'Sign-in cancelled or blocked — continuing in local session.',
  quotaLocalStatus: 'Firestore daily quota exceeded — playing in local session mode.',
  quotaSpinLocalStatus: 'Firestore daily quota exceeded — spin kept locally.',
  jackpotWonSummary: (totalWin) =>
    `PROGRESSIVE JACKPOT WON! 5× Santa (WILD) · +${totalWin}!`,
  freeSpinsWonSummary: (scatters, awarded, totalWin) =>
    `North Star Bonus! ${scatters}× Scatters awarded ${awarded} Free Spins (3× Multiplier) · +${totalWin}`,
  singleLineWinSummary: (lineName, count, symbolName, usedWild, multiplier, totalWin) =>
    `${lineName}: ${count}× ${symbolName}${usedWild ? ' (with Wild)' : ''}${
      multiplier > 1 ? ` · ${multiplier}× Free Spin` : ''
    } · +${totalWin}`,
  multiLineWinSummary: (lineCount, multiplier, totalWin) =>
    `${lineCount} Winning Paylines${multiplier > 1 ? ` (${multiplier}× Free Spin)` : ''} · Total Win +${totalWin}`,
  twoScattersHint: '2× North Stars landed — 1 more triggers 3× Free Spins!',
  noWinStatus: 'No winning line this spin — spin again!',
  volatilityStatus: 'Volatility: Rare Big Wins (Higher Variance)',
  titleSubtitle: '5×3 ALPINE CABINET · 50 PAYLINES',
  titleDescription:
    'Spin five mahogany reels trimmed in brass. Match festive heirlooms across 50 paylines, pair with Santa Wilds, and land 3+ North Stars for 3× Free Spins.',
  play: 'Play',
  signInToSave: 'Sign in to Save',
  titleFooterHints: 'Enter or Space Play · Space Spin · P Paytable · M Mute · Esc Pause',
  paytableTitle: 'Paytable & 50 Paylines',
  paytableStakeLine: (betPerLine, activeLines, totalBet) =>
    `Payouts shown for current stake: ${betPerLine} / line · ${activeLines} lines (${totalBet} total)`,
  closePaytableAria: 'Close paytable',
  jackpotBannerTitle: 'Lot Progressif Noël Royale',
  jackpotBannerDesc: (seed) =>
    `Every spin contributes 2% (min 0.10 €). Land 5× Santa (WILD) on an active payline to win the entire pot + 1 000× line payout! Resets to ${seed}.`,
  currentJackpot: 'Current Jackpot',
  wildRuleTitle: 'Santa Claus · WILD',
  wildRuleDesc:
    'Substitutes for all symbols except the North Star Scatter. 5× on an active payline awards the Progressive Jackpot!',
  scatterRuleTitle: 'North Star · SCATTER',
  scatterRuleDesc:
    '3+ Scatters anywhere award 10 / 15 / 25 Free Spins with a 3× multiplier on all wins.',
  symbolPayoutsHeading: 'Symbol Payouts',
  multipliesTotalBet: 'Multiplies Total Bet',
  multipliesBetPerLine: 'Multiplies Bet / Line',
  paylinesHeading: '50 Payline Patterns (Left to Right)',
  inspectingLabel: 'Inspecting:',
  settingsTitle: 'Cabinet Settings',
  settingsSubtitle: 'Tune language, payout volatility, Christmas music library, and spin speed',
  closeSettingsAria: 'Close settings',
  volatilityHeading: 'Volatility',
  higherVariance: 'Higher Variance',
  rareBigWins: 'Rare Big Wins',
  rareBigWinsDesc:
    'Higher variance · Fewer hits, boosted 4×/5× payouts (1.75× / 2.5×) & +3 bonus Free Spins.',
  audioAndSpeed: 'Audio & Speed',
  musicLibraryTitle: (count) => `Christmas Music Library (${count})`,
  alternance: 'Alternate',
  nextTrack: 'Next',
  activeTrack: 'Active',
  done: 'Done',
  ledgerTitle: 'Cabinet Ledger & Hall of Fame',
  ledgerCloudSynced: (name) => `Synced to cloud as ${name}`,
  ledgerSignInPrompt: 'Sign in with Google to persist your bankroll and spin ledger',
  closeLedgerAria: 'Close ledger',
  hallOfFame: 'Hall of Fame',
  spinHistory: 'My Spin History',
  signInWithGoogle: 'Sign in with Google',
  noLeaderboardYet: 'No high-roller records yet. Sign in and spin to set the first benchmark!',
  youTag: '(You)',
  spinsSummaryLine: (spins, peak) => `${spins} spins · Peak ${peak}`,
  bestWin: 'Best Win',
  signInHistoryPrompt:
    'Sign in with Google to save your 2 500.00 € bankroll and inspect your cloud spin history across sessions.',
  noCloudSpinsYet: 'No cloud spins recorded yet. Place a spin to log your first entry.',
  freeSpinTag: 'Free Spin (3×)',
  betTag: (amount) => `Bet ${amount}`,
  linesTag: (count) => `${count} lines`,
  outOfCredits: 'Out of Credits',
  cabinetPaused: 'Cabinet Paused',
  outOfCreditsDesc: 'Your bankroll is below the minimum 0.10 € bet.',
  pausedDesc: 'Review your session ledger or adjust the cabinet.',
  spinsLabel: 'Spins',
  resume: 'Resume',
  playAgain: 'Play Again (2 500.00 €)',
  resetBankroll: 'Reset Bankroll (2 500.00 €)',
  cabinetSettingsMenu: 'Cabinet Settings & Volatility',
  paytableMenu: 'Paytable & 50 Lines',
  titleScreenMenu: 'Title Screen',
  symbols: {
    WILD: 'Santa Claus',
    SCATTER: 'North Star',
    TREE: 'Christmas Tree',
    BELL: 'Golden Bell',
    GIFT: 'Magic Gift',
    REINDEER: 'Polar Reindeer',
    SNOWMAN: 'Snowman',
    STOCKING: 'Holiday Stocking',
    CANDY: 'Candy Cane',
  },
};

const ES: TranslationDict = {
  languageLabel: 'Idioma',
  chooseLanguageAria: 'Cambiar idioma',
  ledger: 'Ranking',
  signIn: 'Entrar',
  signingIn: 'Entrando...',
  signOut: 'Salir',
  paytable: 'Premios',
  music: 'Música',
  sfx: 'Efectos',
  settings: 'Ajustes',
  pause: 'Pausa',
  balance: 'Saldo',
  lastWin: 'Último premio',
  progressiveJackpot: 'Bote Progresivo',
  jackpotSubtitle: '5× Papá Noel (WILD) · +2% por giro',
  freeSpinsBadge: 'Giros Gratis · 3×',
  lines: 'Líneas',
  betPerLine: 'Apuesta / Línea',
  totalBet: 'Apuesta Total',
  freeMultiplierTag: 'GRATIS (3×)',
  turbo: 'Turbo',
  auto: 'Auto',
  stopAuto: 'Parar Auto',
  betMax: 'Apuesta Máx',
  stop: 'PARAR',
  spin: 'GIRAR',
  freeSpinCount: (remaining) => `GIRO GRATIS (${remaining})`,
  decreaseLinesAria: 'Reducir líneas activas',
  increaseLinesAria: 'Aumentar líneas activas',
  decreaseBetAria: 'Reducir apuesta por línea',
  increaseBetAria: 'Aumentar apuesta por línea',
  stopReelsAria: 'Detener rodillos',
  lineCycleCounter: (index, total) => `Línea ${index}/${total}`,
  cabinetReady: 'Máquina lista · Combina 3+ símbolos de izquierda a derecha en 50 líneas',
  bankrollResetStatus: 'Saldo reiniciado a 2 500.00 € · Listo para girar',
  insufficientBalance: 'Saldo insuficiente — reduce la apuesta o reinicia el saldo.',
  balanceBelowMaxBet: 'Saldo por debajo de la Apuesta Máx de 1 250.00 € — baja la apuesta/línea.',
  spinningFreeStatus: (remaining) => `Giro Gratis activo (3×) · ${remaining} restante(s)...`,
  spinningReelsStatus: (wager) => `Girando 5 rodillos · Apuesta ${wager}...`,
  cloudSyncedStatus: (name) => `Registro sincronizado · Bienvenido, ${name}`,
  signedOutStatus: 'Sesión cerrada — jugando en modo local.',
  signInCancelledStatus: 'Inicio cancelado — continuando en sesión local.',
  quotaLocalStatus: 'Cuota diaria alcanzada — jugando en modo local.',
  quotaSpinLocalStatus: 'Cuota diaria alcanzada — giro guardado localmente.',
  jackpotWonSummary: (totalWin) =>
    `¡BOTE PROGRESIVO GANADO! 5× Papá Noel (WILD) · +${totalWin}!`,
  freeSpinsWonSummary: (scatters, awarded, totalWin) =>
    `¡Bono Estrella Polar! ${scatters}× Scatters → ${awarded} Giros Gratis (3×) · +${totalWin}`,
  singleLineWinSummary: (lineName, count, symbolName, usedWild, multiplier, totalWin) =>
    `${lineName}: ${count}× ${symbolName}${usedWild ? ' (con Wild)' : ''}${
      multiplier > 1 ? ` · ${multiplier}× Giro Gratis` : ''
    } · +${totalWin}`,
  multiLineWinSummary: (lineCount, multiplier, totalWin) =>
    `${lineCount} líneas ganadoras${multiplier > 1 ? ` (${multiplier}× Giro Gratis)` : ''} · Premio total +${totalWin}`,
  twoScattersHint: '2× Estrellas Polares — ¡1 más activa Giros Gratis 3×!',
  noWinStatus: 'Sin línea ganadora esta vez — ¡inténtalo de nuevo!',
  volatilityStatus: 'Volatilidad: Rare Big Wins (Alta varianza)',
  titleSubtitle: 'GABINETE ALPINO 5×3 · 50 LÍNEAS',
  titleDescription:
    'Haz girar cinco rodillos de caoba y latón. Combina tesoros navideños en 50 líneas, únelos a Papá Noel Wild y logra 3+ Estrellas Polares para Giros Gratis 3×.',
  play: 'Jugar',
  signInToSave: 'Entrar para guardar',
  titleFooterHints: 'Enter o Espacio Jugar · Espacio Girar · P Premios · M Silencio · Esc Pausa',
  paytableTitle: 'Tabla de Premios y 50 Líneas',
  paytableStakeLine: (betPerLine, activeLines, totalBet) =>
    `Premios mostrados para: ${betPerLine} / línea · ${activeLines} líneas (${totalBet} total)`,
  closePaytableAria: 'Cerrar tabla de premios',
  jackpotBannerTitle: 'Bote Progresivo Noël Royale',
  jackpotBannerDesc: (seed) =>
    `Cada giro aporta un 2% (mín. 0.10 €). ¡Logra 5× Papá Noel (WILD) en una línea activa para ganar todo el bote + 1 000× la línea! Se reinicia en ${seed}.`,
  currentJackpot: 'Bote Actual',
  wildRuleTitle: 'Papá Noel · WILD',
  wildRuleDesc:
    'Sustituye a todos los símbolos excepto el Scatter. ¡5× en una línea activa otorga el Bote Progresivo!',
  scatterRuleTitle: 'Estrella Polar · SCATTER',
  scatterRuleDesc:
    '3+ Scatters en cualquier posición otorgan 10 / 15 / 25 Giros Gratis con multiplicador 3×.',
  symbolPayoutsHeading: 'Premios por Símbolo',
  multipliesTotalBet: 'Multiplica la Apuesta Total',
  multipliesBetPerLine: 'Multiplica Apuesta / Línea',
  paylinesHeading: '50 Patrones de Línea (Izquierda a Derecha)',
  inspectingLabel: 'Viendo:',
  settingsTitle: 'Ajustes de la Máquina',
  settingsSubtitle: 'Configura idioma, volatilidad, biblioteca musical navideña y velocidad',
  closeSettingsAria: 'Cerrar ajustes',
  volatilityHeading: 'Volatilidad',
  higherVariance: 'Alta varianza',
  rareBigWins: 'Rare Big Wins',
  rareBigWinsDesc:
    'Mayor varianza · Menos aciertos, pagos 4×/5× potenciados (1.75× / 2.5×) y +3 Giros Gratis extra.',
  audioAndSpeed: 'Audio y Velocidad',
  musicLibraryTitle: (count) => `Biblioteca Musical (${count})`,
  alternance: 'Alternar',
  nextTrack: 'Siguiente',
  activeTrack: 'Activo',
  done: 'Listo',
  ledgerTitle: 'Registro Cloud y Salón de la Fama',
  ledgerCloudSynced: (name) => `Sincronizado en la nube como ${name}`,
  ledgerSignInPrompt: 'Inicia sesión con Google para guardar tu saldo e historial',
  closeLedgerAria: 'Cerrar registro',
  hallOfFame: 'Salón de la Fama',
  spinHistory: 'Mi Historial',
  signInWithGoogle: 'Entrar con Google',
  noLeaderboardYet: 'Aún no hay récords. ¡Inicia sesión y gira para marcar el primero!',
  youTag: '(Tú)',
  spinsSummaryLine: (spins, peak) => `${spins} giros · Máximo ${peak}`,
  bestWin: 'Mejor premio',
  signInHistoryPrompt:
    'Inicia sesión con Google para guardar tus 2 500.00 € y ver tu historial entre sesiones.',
  noCloudSpinsYet: 'Aún no hay giros guardados en la nube.',
  freeSpinTag: 'Giro Gratis (3×)',
  betTag: (amount) => `Apuesta ${amount}`,
  linesTag: (count) => `${count} líneas`,
  outOfCredits: 'Sin Créditos',
  cabinetPaused: 'Juego en Pausa',
  outOfCreditsDesc: 'Tu saldo está por debajo de la apuesta mínima de 0.10 €.',
  pausedDesc: 'Revisa tu sesión o ajusta las opciones de la máquina.',
  spinsLabel: 'Giros',
  resume: 'Reanudar',
  playAgain: 'Jugar de nuevo (2 500.00 €)',
  resetBankroll: 'Reiniciar saldo (2 500.00 €)',
  cabinetSettingsMenu: 'Ajustes y Volatilidad',
  paytableMenu: 'Tabla de Premios y 50 Líneas',
  titleScreenMenu: 'Pantalla de Título',
  symbols: {
    WILD: 'Papá Noel',
    SCATTER: 'Estrella Polar',
    TREE: 'Árbol de Navidad',
    BELL: 'Campana Dorada',
    GIFT: 'Regalo Mágico',
    REINDEER: 'Reno Polar',
    SNOWMAN: 'Muñeco de Nieve',
    STOCKING: 'Calcetín Navideño',
    CANDY: 'Bastón de Caramelo',
  },
};

const DE: TranslationDict = {
  languageLabel: 'Sprache',
  chooseLanguageAria: 'Sprache wechseln',
  ledger: 'Bestenliste',
  signIn: 'Anmelden',
  signingIn: 'Anmelden...',
  signOut: 'Abmelden',
  paytable: 'Gewinne',
  music: 'Musik',
  sfx: 'Effekte',
  settings: 'Optionen',
  pause: 'Pause',
  balance: 'Guthaben',
  lastWin: 'Letzter Gewinn',
  progressiveJackpot: 'Progressiver Jackpot',
  jackpotSubtitle: '5× Weihnachtsmann (WILD) · +2% pro Dreh',
  freeSpinsBadge: 'Freispiele · 3×',
  lines: 'Linien',
  betPerLine: 'Einsatz / Linie',
  totalBet: 'Gesamteinsatz',
  freeMultiplierTag: 'GRATIS (3×)',
  turbo: 'Turbo',
  auto: 'Auto',
  stopAuto: 'Stopp Auto',
  betMax: 'Max-Einsatz',
  stop: 'STOPP',
  spin: 'DREHEN',
  freeSpinCount: (remaining) => `FREISPIEL (${remaining})`,
  decreaseLinesAria: 'Aktive Linien verringern',
  increaseLinesAria: 'Aktive Linien erhöhen',
  decreaseBetAria: 'Einsatz pro Linie verringern',
  increaseBetAria: 'Einsatz pro Linie erhöhen',
  stopReelsAria: 'Walzen stoppen',
  lineCycleCounter: (index, total) => `Linie ${index}/${total}`,
  cabinetReady: 'Automat bereit · 3+ Symbole von links nach rechts auf 50 Linien',
  bankrollResetStatus: 'Guthaben auf 2 500.00 € zurückgesetzt · Bereit',
  insufficientBalance: 'Guthaben zu niedrig — Einsatz verringern oder zurücksetzen.',
  balanceBelowMaxBet: 'Guthaben unter 1 250.00 € Max-Einsatz — Einsatz/Linie senken.',
  spinningFreeStatus: (remaining) => `Freispiel aktiv (3×) · noch ${remaining}...`,
  spinningReelsStatus: (wager) => `5 Walzen drehen · Einsatz ${wager}...`,
  cloudSyncedStatus: (name) => `Cloud synchronisiert · Willkommen, ${name}`,
  signedOutStatus: 'Abgemeldet — lokaler Sitzungsmodus.',
  signInCancelledStatus: 'Anmeldung abgebrochen — lokaler Modus aktiv.',
  quotaLocalStatus: 'Firestore-Limit erreicht — lokaler Modus aktiv.',
  quotaSpinLocalStatus: 'Firestore-Limit erreicht — Dreh lokal gespeichert.',
  jackpotWonSummary: (totalWin) =>
    `PROGRESSIVER JACKPOT GEWONNEN! 5× WILD · +${totalWin}!`,
  freeSpinsWonSummary: (scatters, awarded, totalWin) =>
    `Polarstern-Bonus! ${scatters}× Scatter → ${awarded} Freispiele (3×) · +${totalWin}`,
  singleLineWinSummary: (lineName, count, symbolName, usedWild, multiplier, totalWin) =>
    `${lineName}: ${count}× ${symbolName}${usedWild ? ' (mit Wild)' : ''}${
      multiplier > 1 ? ` · ${multiplier}× Freispiel` : ''
    } · +${totalWin}`,
  multiLineWinSummary: (lineCount, multiplier, totalWin) =>
    `${lineCount} Gewinnlinien${multiplier > 1 ? ` (${multiplier}× Freispiel)` : ''} · Gesamtgewinn +${totalWin}`,
  twoScattersHint: '2× Polarsterne — noch 1 für 3× Freispiele!',
  noWinStatus: 'Kein Liniengewinn — versuche es erneut!',
  volatilityStatus: 'Volatilität: Rare Big Wins (Hohe Varianz)',
  titleSubtitle: '5×3 ALPEN-AUTOMAT · 50 LINIEN',
  titleDescription:
    'Drehe fünf Mahagoni-Walzen mit Messingrahmen. Kombiniere Weihnachtssymbole auf 50 Linien mit Santa Wilds und 3+ Polarsternen für 3× Freispiele.',
  play: 'Spielen',
  signInToSave: 'Zum Speichern anmelden',
  titleFooterHints: 'Enter/Leertaste Spielen · Leertaste Drehen · P Gewinne · M Ton · Esc Pause',
  paytableTitle: 'Gewinntabelle & 50 Linien',
  paytableStakeLine: (betPerLine, activeLines, totalBet) =>
    `Auszahlungen für: ${betPerLine} / Linie · ${activeLines} Linien (${totalBet} gesamt)`,
  closePaytableAria: 'Gewinntabelle schließen',
  jackpotBannerTitle: 'Progressiver Jackpot Noël Royale',
  jackpotBannerDesc: (seed) =>
    `Jeder Dreh trägt 2% bei (min. 0.10 €). 5× Weihnachtsmann (WILD) auf einer aktiven Linie gewinnt den ganzen Pot + 1 000× Linieneinsatz! Reset auf ${seed}.`,
  currentJackpot: 'Aktueller Jackpot',
  wildRuleTitle: 'Weihnachtsmann · WILD',
  wildRuleDesc:
    'Ersetzt alle Symbole außer Scatter. 5× auf einer aktiven Linie gewinnt den Progressiven Jackpot!',
  scatterRuleTitle: 'Polarstern · SCATTER',
  scatterRuleDesc:
    '3+ Scatter überall bringen 10 / 15 / 25 Freispiele mit 3× Multiplikator auf alle Gewinne.',
  symbolPayoutsHeading: 'Symbol-Auszahlungen',
  multipliesTotalBet: 'Multipliziert Gesamteinsatz',
  multipliesBetPerLine: 'Multipliziert Einsatz / Linie',
  paylinesHeading: '50 Linienmuster (Links nach Rechts)',
  inspectingLabel: 'Vorschau:',
  settingsTitle: 'Automateneinstellungen',
  settingsSubtitle: 'Sprache, Volatilität, Weihnachtsmusik-Bibliothek und Tempo anpassen',
  closeSettingsAria: 'Einstellungen schließen',
  volatilityHeading: 'Volatilität',
  higherVariance: 'Hohe Varianz',
  rareBigWins: 'Rare Big Wins',
  rareBigWinsDesc:
    'Höhere Varianz · Seltenere Treffer, verstärkte 4×/5× Gewinne (1.75× / 2.5×) & +3 Bonus-Freispiele.',
  audioAndSpeed: 'Audio & Tempo',
  musicLibraryTitle: (count) => `Musikbibliothek (${count})`,
  alternance: 'Wechsel',
  nextTrack: 'Weiter',
  activeTrack: 'Aktiv',
  done: 'Fertig',
  ledgerTitle: 'Cloud-Konto & Ruhmeshalle',
  ledgerCloudSynced: (name) => `Synchronisiert als ${name}`,
  ledgerSignInPrompt: 'Mit Google anmelden, um Guthaben und Verlauf zu speichern',
  closeLedgerAria: 'Bestenliste schließen',
  hallOfFame: 'Ruhmeshalle',
  spinHistory: 'Mein Verlauf',
  signInWithGoogle: 'Mit Google anmelden',
  noLeaderboardYet: 'Noch keine Rekorde. Melde dich an und drehe los!',
  youTag: '(Du)',
  spinsSummaryLine: (spins, peak) => `${spins} Drehs · Höchststand ${peak}`,
  bestWin: 'Bester Gewinn',
  signInHistoryPrompt:
    'Melde dich mit Google an, um 2 500.00 € zu sichern und deinen Cloud-Verlauf anzusehen.',
  noCloudSpinsYet: 'Noch keine Cloud-Drehs aufgezeichnet.',
  freeSpinTag: 'Freispiel (3×)',
  betTag: (amount) => `Einsatz ${amount}`,
  linesTag: (count) => `${count} Linien`,
  outOfCredits: 'Kein Guthaben',
  cabinetPaused: 'Spiel Pausiert',
  outOfCreditsDesc: 'Dein Guthaben liegt unter dem Mindesteinsatz von 0.10 €.',
  pausedDesc: 'Prüfe deinen Verlauf oder passe die Automateneinstellungen an.',
  spinsLabel: 'Drehs',
  resume: 'Fortsetzen',
  playAgain: 'Nochmal spielen (2 500.00 €)',
  resetBankroll: 'Guthaben zurücksetzen (2 500.00 €)',
  cabinetSettingsMenu: 'Einstellungen & Volatilität',
  paytableMenu: 'Gewinntabelle & 50 Linien',
  titleScreenMenu: 'Titelbildschirm',
  symbols: {
    WILD: 'Weihnachtsmann',
    SCATTER: 'Polarstern',
    TREE: 'Weihnachtsbaum',
    BELL: 'Goldene Glocke',
    GIFT: 'Zaubergeschenk',
    REINDEER: 'Polarrentier',
    SNOWMAN: 'Schneemann',
    STOCKING: 'Weihnachtsstrumpf',
    CANDY: 'Zuckerstange',
  },
};

const IT: TranslationDict = {
  languageLabel: 'Lingua',
  chooseLanguageAria: 'Cambia lingua',
  ledger: 'Classifica',
  signIn: 'Accedi',
  signingIn: 'Accesso...',
  signOut: 'Esci',
  paytable: 'Premi',
  music: 'Musica',
  sfx: 'Effetti',
  settings: 'Opzioni',
  pause: 'Pausa',
  balance: 'Saldo',
  lastWin: 'Ultima vincita',
  progressiveJackpot: 'Jackpot Progressivo',
  jackpotSubtitle: '5× Babbo Natale (WILD) · +2% a giro',
  freeSpinsBadge: 'Giri Gratis · 3×',
  lines: 'Linee',
  betPerLine: 'Puntata / Linea',
  totalBet: 'Puntata Totale',
  freeMultiplierTag: 'GRATIS (3×)',
  turbo: 'Turbo',
  auto: 'Auto',
  stopAuto: 'Stop Auto',
  betMax: 'Puntata Max',
  stop: 'STOP',
  spin: 'GIRA',
  freeSpinCount: (remaining) => `GIRO GRATIS (${remaining})`,
  decreaseLinesAria: 'Riduci linee attive',
  increaseLinesAria: 'Aumenta linee attive',
  decreaseBetAria: 'Riduci puntata per linea',
  increaseBetAria: 'Aumenta puntata per linea',
  stopReelsAria: 'Ferma i rulli',
  lineCycleCounter: (index, total) => `Linea ${index}/${total}`,
  cabinetReady: 'Slot pronta · Abbina 3+ simboli da sinistra a destra su 50 linee',
  bankrollResetStatus: 'Saldo reimpostato a 2 500.00 € · Pronto a girare',
  insufficientBalance: 'Saldo insufficiente — riduci la puntata o reimposta il saldo.',
  balanceBelowMaxBet: 'Saldo inferiore alla Puntata Max di 1 250.00 € — riduci puntata/linea.',
  spinningFreeStatus: (remaining) => `Giro Gratis attivo (3×) · ${remaining} rimasti...`,
  spinningReelsStatus: (wager) => `Rotazione dei 5 rulli · Puntata ${wager}...`,
  cloudSyncedStatus: (name) => `Cloud sincronizzato · Bentornato, ${name}`,
  signedOutStatus: 'Disconnesso — sessione locale attiva.',
  signInCancelledStatus: 'Accesso annullato — sessione locale mantenuta.',
  quotaLocalStatus: 'Quota Firestore superata — modalità locale attiva.',
  quotaSpinLocalStatus: 'Quota Firestore superata — giro salvato localmente.',
  jackpotWonSummary: (totalWin) =>
    `JACKPOT PROGRESSIVO VINTO! 5× Babbo Natale (WILD) · +${totalWin}!`,
  freeSpinsWonSummary: (scatters, awarded, totalWin) =>
    `Bonus Stella Polare! ${scatters}× Scatter → ${awarded} Giri Gratis (3×) · +${totalWin}`,
  singleLineWinSummary: (lineName, count, symbolName, usedWild, multiplier, totalWin) =>
    `${lineName}: ${count}× ${symbolName}${usedWild ? ' (con Wild)' : ''}${
      multiplier > 1 ? ` · ${multiplier}× Giro Gratis` : ''
    } · +${totalWin}`,
  multiLineWinSummary: (lineCount, multiplier, totalWin) =>
    `${lineCount} linee vincenti${multiplier > 1 ? ` (${multiplier}× Giro Gratis)` : ''} · Vincita totale +${totalWin}`,
  twoScattersHint: '2× Stelle Polari — ancora 1 per attivare i Giri Gratis 3×!',
  noWinStatus: 'Nessuna linea vincente — riprova!',
  volatilityStatus: 'Volatilità: Rare Big Wins (Alta varianza)',
  titleSubtitle: 'CABINET ALPINO 5×3 · 50 LINEE',
  titleDescription:
    'Fai girare cinque rulli in mogano e ottone. Abbina i tesori natalizi su 50 linee, sfruttando Babbo Natale Wild e 3+ Stelle Polari per Giri Gratis 3×.',
  play: 'Gioca',
  signInToSave: 'Accedi per salvare',
  titleFooterHints: 'Invio o Spazio Gioca · Spazio Gira · P Premi · M Muto · Esc Pausa',
  paytableTitle: 'Tabella Premi & 50 Linee',
  paytableStakeLine: (betPerLine, activeLines, totalBet) =>
    `Vincite mostrate per: ${betPerLine} / linea · ${activeLines} linee (${totalBet} totale)`,
  closePaytableAria: 'Chiudi tabella premi',
  jackpotBannerTitle: 'Jackpot Progressivo Noël Royale',
  jackpotBannerDesc: (seed) =>
    `Ogni giro contribuisce per il 2% (min 0.10 €). Ottieni 5× Babbo Natale (WILD) su una linea attiva per vincere l’intero montepremi + 1 000× la puntata/linea! Si azzera a ${seed}.`,
  currentJackpot: 'Montepremi Attuale',
  wildRuleTitle: 'Babbo Natale · WILD',
  wildRuleDesc:
    'Sostituisce tutti i simboli tranne lo Scatter. 5× su una linea attiva assegna il Jackpot Progressivo!',
  scatterRuleTitle: 'Stella Polare · SCATTER',
  scatterRuleDesc:
    '3+ Scatter ovunque assegnano 10 / 15 / 25 Giri Gratis con moltiplicatore 3× su tutte le vincite.',
  symbolPayoutsHeading: 'Vincite per Simbolo',
  multipliesTotalBet: 'Moltiplica la Puntata Totale',
  multipliesBetPerLine: 'Moltiplica Puntata / Linea',
  paylinesHeading: '50 Schemi di Linea (Da Sinistra a Destra)',
  inspectingLabel: 'Anteprima:',
  settingsTitle: 'Impostazioni Slot',
  settingsSubtitle: 'Scegli lingua, volatilità, libreria musicale natalizia e velocità',
  closeSettingsAria: 'Chiudi impostazioni',
  volatilityHeading: 'Volatilità',
  higherVariance: 'Alta varianza',
  rareBigWins: 'Rare Big Wins',
  rareBigWinsDesc:
    'Maggiore varianza · Meno vincite frequenti, premi 4×/5× potenziati (1.75× / 2.5×) e +3 Giri Gratis bonus.',
  audioAndSpeed: 'Audio & Velocità',
  musicLibraryTitle: (count) => `Libreria Musicale (${count})`,
  alternance: 'Alternanza',
  nextTrack: 'Successivo',
  activeTrack: 'Attivo',
  done: 'Fatto',
  ledgerTitle: 'Registro Cloud & Hall of Fame',
  ledgerCloudSynced: (name) => `Sincronizzato sul cloud come ${name}`,
  ledgerSignInPrompt: 'Accedi con Google per salvare saldo e cronologia dei giri',
  closeLedgerAria: 'Chiudi registro',
  hallOfFame: 'Hall of Fame',
  spinHistory: 'Cronologia Giri',
  signInWithGoogle: 'Accedi con Google',
  noLeaderboardYet: 'Nessun record ancora. Accedi e gira per stabilire il primo primato!',
  youTag: '(Tu)',
  spinsSummaryLine: (spins, peak) => `${spins} giri · Picco ${peak}`,
  bestWin: 'Miglior vincita',
  signInHistoryPrompt:
    'Accedi con Google per salvare i tuoi 2 500.00 € e consultare la cronologia cloud.',
  noCloudSpinsYet: 'Nessun giro cloud registrato finora.',
  freeSpinTag: 'Giro Gratis (3×)',
  betTag: (amount) => `Puntata ${amount}`,
  linesTag: (count) => `${count} linee`,
  outOfCredits: 'Crediti Esauriti',
  cabinetPaused: 'Gioco in Pausa',
  outOfCreditsDesc: 'Il tuo saldo è inferiore alla puntata minima di 0.10 €.',
  pausedDesc: 'Controlla la sessione o regola le impostazioni della slot.',
  spinsLabel: 'Giri',
  resume: 'Riprendi',
  playAgain: 'Gioca ancora (2 500.00 €)',
  resetBankroll: 'Reimposta saldo (2 500.00 €)',
  cabinetSettingsMenu: 'Impostazioni & Volatilità',
  paytableMenu: 'Tabella Premi & 50 Linee',
  titleScreenMenu: 'Schermata Titolo',
  symbols: {
    WILD: 'Babbo Natale',
    SCATTER: 'Stella Polare',
    TREE: 'Albero di Natale',
    BELL: "Campana d'Oro",
    GIFT: 'Regalo Magico',
    REINDEER: 'Renna Polare',
    SNOWMAN: 'Pupazzo di Neve',
    STOCKING: 'Calza Natalizia',
    CANDY: 'Bastoncino di Zucchero',
  },
};

const PT: TranslationDict = {
  languageLabel: 'Idioma',
  chooseLanguageAria: 'Alterar idioma',
  ledger: 'Classificação',
  signIn: 'Entrar',
  signingIn: 'Entrando...',
  signOut: 'Sair',
  paytable: 'Prémios',
  music: 'Música',
  sfx: 'Efeitos',
  settings: 'Opções',
  pause: 'Pausa',
  balance: 'Saldo',
  lastWin: 'Último prémio',
  progressiveJackpot: 'Prémio Progressivo',
  jackpotSubtitle: '5× Pai Natal (WILD) · +2% por jogada',
  freeSpinsBadge: 'Rodadas Grátis · 3×',
  lines: 'Linhas',
  betPerLine: 'Aposta / Linha',
  totalBet: 'Aposta Total',
  freeMultiplierTag: 'GRÁTIS (3×)',
  turbo: 'Turbo',
  auto: 'Auto',
  stopAuto: 'Parar Auto',
  betMax: 'Aposta Máx',
  stop: 'PARAR',
  spin: 'GIRAR',
  freeSpinCount: (remaining) => `RODADA GRÁTIS (${remaining})`,
  decreaseLinesAria: 'Diminuir linhas ativas',
  increaseLinesAria: 'Aumentar linhas ativas',
  decreaseBetAria: 'Diminuir aposta por linha',
  increaseBetAria: 'Aumentar aposta por linha',
  stopReelsAria: 'Parar rolos',
  lineCycleCounter: (index, total) => `Linha ${index}/${total}`,
  cabinetReady: 'Máquina pronta · Combine 3+ símbolos da esquerda para a direita em 50 linhas',
  bankrollResetStatus: 'Saldo reposto em 2 500.00 € · Pronto a girar',
  insufficientBalance: 'Saldo insuficiente — baixe a aposta ou reponha o saldo.',
  balanceBelowMaxBet: 'Saldo abaixo da Aposta Máx de 1 250.00 € — baixe a aposta/linha.',
  spinningFreeStatus: (remaining) => `Rodada Grátis ativa (3×) · ${remaining} restante(s)...`,
  spinningReelsStatus: (wager) => `A girar 5 rolos · Aposta ${wager}...`,
  cloudSyncedStatus: (name) => `Registo sincronizado · Bem-vindo, ${name}`,
  signedOutStatus: 'Sessão terminada — a jogar em modo local.',
  signInCancelledStatus: 'Início cancelado — sessão local mantida.',
  quotaLocalStatus: 'Quota diária atingida — modo local ativo.',
  quotaSpinLocalStatus: 'Quota diária atingida — jogada guardada localmente.',
  jackpotWonSummary: (totalWin) =>
    `PRÉMIO PROGRESSIVO GANHO! 5× Pai Natal (WILD) · +${totalWin}!`,
  freeSpinsWonSummary: (scatters, awarded, totalWin) =>
    `Bónus Estrela Polar! ${scatters}× Scatters → ${awarded} Rodadas Grátis (3×) · +${totalWin}`,
  singleLineWinSummary: (lineName, count, symbolName, usedWild, multiplier, totalWin) =>
    `${lineName}: ${count}× ${symbolName}${usedWild ? ' (com Wild)' : ''}${
      multiplier > 1 ? ` · ${multiplier}× Rodada Grátis` : ''
    } · +${totalWin}`,
  multiLineWinSummary: (lineCount, multiplier, totalWin) =>
    `${lineCount} linhas premiadas${multiplier > 1 ? ` (${multiplier}× Rodada Grátis)` : ''} · Total +${totalWin}`,
  twoScattersHint: '2× Estrelas Polares — falta 1 para Rodadas Grátis 3×!',
  noWinStatus: 'Sem linha premiada desta vez — tente novamente!',
  volatilityStatus: 'Volatilidade: Rare Big Wins (Variância elevada)',
  titleSubtitle: 'GABINETE ALPINO 5×3 · 50 LINHAS',
  titleDescription:
    'Gire cinco rolos de mogno e latão. Combine símbolos natalícios em 50 linhas, junte o Pai Natal Wild e consiga 3+ Estrelas Polares para Rodadas Grátis 3×.',
  play: 'Jogar',
  signInToSave: 'Entrar para guardar',
  titleFooterHints: 'Enter ou Espaço Jogar · Espaço Girar · P Prémios · M Som · Esc Pausa',
  paytableTitle: 'Tabela de Prémios & 50 Linhas',
  paytableStakeLine: (betPerLine, activeLines, totalBet) =>
    `Prémios para aposta atual: ${betPerLine} / linha · ${activeLines} linhas (${totalBet} total)`,
  closePaytableAria: 'Fechar tabela de prémios',
  jackpotBannerTitle: 'Prémio Progressivo Noël Royale',
  jackpotBannerDesc: (seed) =>
    `Cada jogada contribui com 2% (mín. 0.10 €). Acerte 5× Pai Natal (WILD) numa linha ativa para ganhar todo o pote + 1 000× aposta/linha! Reposto em ${seed}.`,
  currentJackpot: 'Prémio Atual',
  wildRuleTitle: 'Pai Natal · WILD',
  wildRuleDesc:
    'Substitui todos os símbolos exceto o Scatter. 5× numa linha ativa ganha o Prémio Progressivo!',
  scatterRuleTitle: 'Estrela Polar · SCATTER',
  scatterRuleDesc:
    '3+ Scatters em qualquer posição atribuem 10 / 15 / 25 Rodadas Grátis com multiplicador 3×.',
  symbolPayoutsHeading: 'Prémios por Símbolo',
  multipliesTotalBet: 'Multiplica a Aposta Total',
  multipliesBetPerLine: 'Multiplica Aposta / Linha',
  paylinesHeading: '50 Padrões de Linha (Esquerda para a Direita)',
  inspectingLabel: 'A inspecionar:',
  settingsTitle: 'Definições da Máquina',
  settingsSubtitle: 'Ajuste idioma, volatilidade, biblioteca musical natalícia e velocidade',
  closeSettingsAria: 'Fechar definições',
  volatilityHeading: 'Volatilidade',
  higherVariance: 'Variância elevada',
  rareBigWins: 'Rare Big Wins',
  rareBigWinsDesc:
    'Maior variância · Menos acertos, prémios 4×/5× reforçados (1.75× / 2.5×) e +3 Rodadas Grátis extra.',
  audioAndSpeed: 'Áudio e Velocidade',
  musicLibraryTitle: (count) => `Biblioteca Musical (${count})`,
  alternance: 'Alternar',
  nextTrack: 'Seguinte',
  activeTrack: 'Ativo',
  done: 'Concluir',
  ledgerTitle: 'Registo Cloud & Galeria de Honra',
  ledgerCloudSynced: (name) => `Sincronizado na cloud como ${name}`,
  ledgerSignInPrompt: 'Entre com Google para guardar o seu saldo e histórico',
  closeLedgerAria: 'Fechar registo',
  hallOfFame: 'Galeria de Honra',
  spinHistory: 'O Meu Histórico',
  signInWithGoogle: 'Entrar com Google',
  noLeaderboardYet: 'Ainda sem recordes. Entre e jogue para definir o primeiro!',
  youTag: '(Você)',
  spinsSummaryLine: (spins, peak) => `${spins} jogadas · Máximo ${peak}`,
  bestWin: 'Melhor prémio',
  signInHistoryPrompt:
    'Entre com Google para guardar os seus 2 500.00 € e consultar o histórico cloud entre sessões.',
  noCloudSpinsYet: 'Ainda sem jogadas registadas na cloud.',
  freeSpinTag: 'Rodada Grátis (3×)',
  betTag: (amount) => `Aposta ${amount}`,
  linesTag: (count) => `${count} linhas`,
  outOfCredits: 'Sem Créditos',
  cabinetPaused: 'Jogo em Pausa',
  outOfCreditsDesc: 'O seu saldo está abaixo da aposta mínima de 0.10 €.',
  pausedDesc: 'Consulte a sua sessão ou ajuste as definições da máquina.',
  spinsLabel: 'Jogadas',
  resume: 'Retomar',
  playAgain: 'Jogar novamente (2 500.00 €)',
  resetBankroll: 'Repor saldo (2 500.00 €)',
  cabinetSettingsMenu: 'Definições & Volatilidade',
  paytableMenu: 'Tabela de Prémios & 50 Linhas',
  titleScreenMenu: 'Ecrã Inicial',
  symbols: {
    WILD: 'Pai Natal',
    SCATTER: 'Estrela Polar',
    TREE: 'Árvore de Natal',
    BELL: 'Sino Dourado',
    GIFT: 'Presente Mágico',
    REINDEER: 'Rena Polar',
    SNOWMAN: 'Boneco de Neve',
    STOCKING: 'Meia de Natal',
    CANDY: 'Bengala Doce',
  },
};

export const TRANSLATIONS: Record<LanguageCode, TranslationDict> = {
  fr: FR,
  en: EN,
  es: ES,
  de: DE,
  it: IT,
  pt: PT,
};

export function getTranslation(lang: LanguageCode): TranslationDict {
  return TRANSLATIONS[lang] ?? TRANSLATIONS.en;
}
