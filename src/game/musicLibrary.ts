export interface MelodyNote {
  freq: number | null;
  beats: number;
  bassFreq?: number | null;
}

export type MusicTimbre = 'musicbox' | 'bells' | 'warm';

export interface ChristmasMusicTheme {
  id: string;
  title: string;
  subtitle: string;
  beatSec: number;
  timbre: MusicTimbre;
  notes: readonly MelodyNote[];
}

export const CHRISTMAS_MUSIC_LIBRARY: readonly ChristmasMusicTheme[] = [
  {
    id: 'we-wish',
    title: 'We Wish You a Merry Christmas',
    subtitle: 'Boîte à musique · 3/4',
    beatSec: 0.38,
    timbre: 'musicbox',
    notes: [
      { freq: 392.0, beats: 1, bassFreq: 196.0 },
      { freq: 523.25, beats: 1, bassFreq: 130.81 },
      { freq: 523.25, beats: 0.5 },
      { freq: 587.33, beats: 0.5 },
      { freq: 523.25, beats: 0.5 },
      { freq: 493.88, beats: 0.5 },
      { freq: 440.0, beats: 1, bassFreq: 110.0 },
      { freq: 440.0, beats: 1 },

      { freq: 440.0, beats: 1, bassFreq: 146.83 },
      { freq: 587.33, beats: 1 },
      { freq: 587.33, beats: 0.5 },
      { freq: 659.25, beats: 0.5 },
      { freq: 587.33, beats: 0.5 },
      { freq: 523.25, beats: 0.5 },
      { freq: 493.88, beats: 1, bassFreq: 196.0 },
      { freq: 392.0, beats: 1 },

      { freq: 392.0, beats: 1, bassFreq: 164.81 },
      { freq: 659.25, beats: 1 },
      { freq: 659.25, beats: 0.5 },
      { freq: 698.46, beats: 0.5 },
      { freq: 659.25, beats: 0.5 },
      { freq: 587.33, beats: 0.5 },
      { freq: 523.25, beats: 1, bassFreq: 110.0 },
      { freq: 440.0, beats: 1 },

      { freq: 392.0, beats: 0.5, bassFreq: 146.83 },
      { freq: 392.0, beats: 0.5 },
      { freq: 440.0, beats: 1 },
      { freq: 587.33, beats: 1 },
      { freq: 493.88, beats: 1, bassFreq: 196.0 },
      { freq: 523.25, beats: 2, bassFreq: 130.81 },
      { freq: null, beats: 1.5 },
    ],
  },
  {
    id: 'jingle-bells',
    title: 'Vive le Vent (Jingle Bells)',
    subtitle: 'Clochettes · 4/4',
    beatSec: 0.34,
    timbre: 'bells',
    notes: [
      { freq: 659.25, beats: 1, bassFreq: 130.81 },
      { freq: 659.25, beats: 1 },
      { freq: 659.25, beats: 2, bassFreq: 196.0 },

      { freq: 659.25, beats: 1, bassFreq: 130.81 },
      { freq: 659.25, beats: 1 },
      { freq: 659.25, beats: 2, bassFreq: 196.0 },

      { freq: 659.25, beats: 1, bassFreq: 130.81 },
      { freq: 783.99, beats: 1 },
      { freq: 523.25, beats: 1.5, bassFreq: 196.0 },
      { freq: 587.33, beats: 0.5 },
      { freq: 659.25, beats: 3, bassFreq: 130.81 },
      { freq: null, beats: 1 },

      { freq: 698.46, beats: 1, bassFreq: 174.61 },
      { freq: 698.46, beats: 1 },
      { freq: 698.46, beats: 1.5 },
      { freq: 698.46, beats: 0.5 },

      { freq: 698.46, beats: 1, bassFreq: 130.81 },
      { freq: 659.25, beats: 1 },
      { freq: 659.25, beats: 1 },
      { freq: 659.25, beats: 0.5 },
      { freq: 659.25, beats: 0.5 },

      { freq: 783.99, beats: 1, bassFreq: 196.0 },
      { freq: 783.99, beats: 1 },
      { freq: 698.46, beats: 1 },
      { freq: 587.33, beats: 1 },
      { freq: 523.25, beats: 2.5, bassFreq: 130.81 },
      { freq: null, beats: 1.5 },
    ],
  },
  {
    id: 'silent-night',
    title: 'Douce Nuit (Silent Night)',
    subtitle: 'Veillée Alpine · 3/4',
    beatSec: 0.44,
    timbre: 'warm',
    notes: [
      { freq: 392.0, beats: 1.5, bassFreq: 130.81 },
      { freq: 440.0, beats: 0.5 },
      { freq: 392.0, beats: 1 },
      { freq: 329.63, beats: 3, bassFreq: 130.81 },

      { freq: 392.0, beats: 1.5, bassFreq: 130.81 },
      { freq: 440.0, beats: 0.5 },
      { freq: 392.0, beats: 1 },
      { freq: 329.63, beats: 3, bassFreq: 130.81 },

      { freq: 587.33, beats: 2, bassFreq: 196.0 },
      { freq: 587.33, beats: 1 },
      { freq: 493.88, beats: 3, bassFreq: 196.0 },

      { freq: 523.25, beats: 2, bassFreq: 130.81 },
      { freq: 523.25, beats: 1 },
      { freq: 392.0, beats: 3, bassFreq: 130.81 },

      { freq: 440.0, beats: 2, bassFreq: 174.61 },
      { freq: 440.0, beats: 1 },
      { freq: 523.25, beats: 1.5 },
      { freq: 493.88, beats: 0.5 },
      { freq: 440.0, beats: 1 },

      { freq: 392.0, beats: 1.5, bassFreq: 130.81 },
      { freq: 440.0, beats: 0.5 },
      { freq: 392.0, beats: 1 },
      { freq: 329.63, beats: 3, bassFreq: 130.81 },

      { freq: 587.33, beats: 2, bassFreq: 196.0 },
      { freq: 587.33, beats: 1 },
      { freq: 698.46, beats: 1.5 },
      { freq: 587.33, beats: 0.5 },
      { freq: 493.88, beats: 1 },
      { freq: 523.25, beats: 3, bassFreq: 130.81 },
      { freq: 659.25, beats: 2.5 },
      { freq: null, beats: 1.5 },
    ],
  },
  {
    id: 'o-christmas-tree',
    title: 'Mon Beau Sapin (O Tannenbaum)',
    subtitle: 'Boîte à musique · 3/4',
    beatSec: 0.4,
    timbre: 'musicbox',
    notes: [
      { freq: 261.63, beats: 1, bassFreq: 174.61 },
      { freq: 349.23, beats: 0.75, bassFreq: 174.61 },
      { freq: 349.23, beats: 0.25 },
      { freq: 349.23, beats: 1 },
      { freq: 392.0, beats: 1 },

      { freq: 440.0, beats: 0.75, bassFreq: 174.61 },
      { freq: 440.0, beats: 0.25 },
      { freq: 440.0, beats: 1.5 },
      { freq: 440.0, beats: 0.5 },

      { freq: 392.0, beats: 0.5, bassFreq: 130.81 },
      { freq: 440.0, beats: 0.5 },
      { freq: 466.16, beats: 1 },
      { freq: 329.63, beats: 1 },
      { freq: 392.0, beats: 1, bassFreq: 174.61 },
      { freq: 349.23, beats: 1.5 },

      { freq: 523.25, beats: 0.5, bassFreq: 233.08 },
      { freq: 523.25, beats: 0.5 },
      { freq: 440.0, beats: 0.5 },
      { freq: 587.33, beats: 1.5 },
      { freq: 523.25, beats: 0.5 },

      { freq: 523.25, beats: 0.5, bassFreq: 196.0 },
      { freq: 466.16, beats: 0.5 },
      { freq: 466.16, beats: 1.5 },
      { freq: 466.16, beats: 0.5 },

      { freq: 466.16, beats: 0.5, bassFreq: 130.81 },
      { freq: 392.0, beats: 0.5 },
      { freq: 523.25, beats: 1.5 },
      { freq: 466.16, beats: 0.5 },
      { freq: 466.16, beats: 0.5, bassFreq: 174.61 },
      { freq: 440.0, beats: 0.5 },
      { freq: 440.0, beats: 2 },
      { freq: null, beats: 1.5 },
    ],
  },
  {
    id: 'deck-the-halls',
    title: 'Deck the Halls',
    subtitle: 'Carillon festif · 4/4',
    beatSec: 0.34,
    timbre: 'bells',
    notes: [
      { freq: 783.99, beats: 1.5, bassFreq: 130.81 },
      { freq: 698.46, beats: 0.5 },
      { freq: 659.25, beats: 1 },
      { freq: 587.33, beats: 1 },
      { freq: 523.25, beats: 1, bassFreq: 196.0 },
      { freq: 587.33, beats: 1 },
      { freq: 659.25, beats: 1 },
      { freq: 523.25, beats: 1 },

      { freq: 587.33, beats: 0.5, bassFreq: 196.0 },
      { freq: 659.25, beats: 0.5 },
      { freq: 698.46, beats: 0.5 },
      { freq: 587.33, beats: 0.5 },
      { freq: 659.25, beats: 1.5, bassFreq: 130.81 },
      { freq: 587.33, beats: 0.5 },
      { freq: 523.25, beats: 1 },
      { freq: 493.88, beats: 1 },
      { freq: 523.25, beats: 2, bassFreq: 130.81 },

      { freq: 587.33, beats: 1.5, bassFreq: 196.0 },
      { freq: 659.25, beats: 0.5 },
      { freq: 698.46, beats: 1 },
      { freq: 587.33, beats: 1 },
      { freq: 659.25, beats: 1.5, bassFreq: 130.81 },
      { freq: 698.46, beats: 0.5 },
      { freq: 783.99, beats: 1 },
      { freq: 587.33, beats: 1 },

      { freq: 659.25, beats: 0.5, bassFreq: 174.61 },
      { freq: 698.46, beats: 0.5 },
      { freq: 783.99, beats: 1 },
      { freq: 880.0, beats: 0.5 },
      { freq: 783.99, beats: 0.5 },
      { freq: 698.46, beats: 1 },
      { freq: 659.25, beats: 1, bassFreq: 196.0 },
      { freq: 587.33, beats: 1 },
      { freq: 523.25, beats: 2.5, bassFreq: 130.81 },
      { freq: null, beats: 1.5 },
    ],
  },
];

export function getNextThemeIndex(currentIdx: number, total: number = CHRISTMAS_MUSIC_LIBRARY.length): number {
  if (total <= 0) return 0;
  return (currentIdx + 1) % total;
}
