import {
  CHRISTMAS_MUSIC_LIBRARY,
  ChristmasMusicTheme,
  getNextThemeIndex,
  MelodyNote,
  MusicTimbre,
} from './musicLibrary';

class SlotAudioEngine {
  private ctx: AudioContext | null = null;
  private sfxMuted = false;
  private musicEnabled = true;
  private autoAlternate = true;
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private themeIndex = 0;
  private melodyIndex = 0;
  private nextNoteTime = 0;
  private themeListeners = new Set<(theme: ChristmasMusicTheme) => void>();

  private notifyThemeChange() {
    const current = this.getCurrentTheme();
    this.themeListeners.forEach((listener) => listener(current));
  }

  private getOrCreateContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private ensureSfxContext(): AudioContext | null {
    if (this.sfxMuted) return null;
    const ctx = this.getOrCreateContext();
    if (ctx && this.musicEnabled && this.musicTimer === null) {
      this.startMusicLoop();
    }
    return ctx;
  }

  private ensureMusicGain(ctx: AudioContext): GainNode {
    if (!this.musicGain) {
      this.musicGain = ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicEnabled ? 1 : 0, ctx.currentTime);
      this.musicGain.connect(ctx.destination);
    }
    return this.musicGain;
  }

  private scheduleMusicNote(
    ctx: AudioContext,
    dest: GainNode,
    note: MelodyNote,
    beatSec: number,
    timbre: MusicTimbre,
    time: number,
  ) {
    const duration = note.beats * beatSec;

    if (note.freq) {
      const osc = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const gain = ctx.createGain();
      const harmonicGain = ctx.createGain();

      if (timbre === 'bells') {
        osc.type = 'sine';
        harmonic.type = 'sine';
        harmonic.frequency.setValueAtTime(note.freq * 3, time);
        harmonicGain.gain.setValueAtTime(0.14, time);
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(0.03, time + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0008, time + Math.max(0.22, duration * 1.05));
      } else if (timbre === 'warm') {
        osc.type = 'triangle';
        harmonic.type = 'sine';
        harmonic.frequency.setValueAtTime(note.freq * 0.5, time);
        harmonicGain.gain.setValueAtTime(0.22, time);
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(0.028, time + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0008, time + Math.max(0.24, duration * 1.1));
      } else {
        // Classic celesta / music-box chime
        osc.type = 'sine';
        harmonic.type = 'triangle';
        harmonic.frequency.setValueAtTime(note.freq * 2, time);
        harmonicGain.gain.setValueAtTime(0.18, time);
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(0.032, time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0008, time + Math.max(0.18, duration * 0.95));
      }

      osc.frequency.setValueAtTime(note.freq, time);
      osc.connect(gain);
      harmonic.connect(harmonicGain);
      harmonicGain.connect(gain);
      gain.connect(dest);

      osc.start(time);
      harmonic.start(time);
      osc.stop(time + duration + 0.08);
      harmonic.stop(time + duration + 0.08);
    }

    if (note.bassFreq) {
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(note.bassFreq, time);

      bassGain.gain.setValueAtTime(0.0001, time);
      bassGain.gain.linearRampToValueAtTime(0.022, time + 0.04);
      bassGain.gain.exponentialRampToValueAtTime(0.0008, time + duration * 1.4);

      bass.connect(bassGain);
      bassGain.connect(dest);
      bass.start(time);
      bass.stop(time + duration * 1.45);
    }
  }

  private startMusicLoop() {
    if (typeof window === 'undefined' || !this.musicEnabled) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;
    const dest = this.ensureMusicGain(ctx);
    dest.gain.cancelScheduledValues(ctx.currentTime);
    dest.gain.setTargetAtTime(1, ctx.currentTime, 0.06);

    if (this.musicTimer !== null) return;

    this.nextNoteTime = Math.max(this.nextNoteTime, ctx.currentTime + 0.05);

    const tick = () => {
      if (!this.musicEnabled || !this.ctx) return;
      if (this.ctx.state !== 'running') return;
      const horizon = this.ctx.currentTime + 0.25;
      if (this.nextNoteTime < this.ctx.currentTime) {
        this.nextNoteTime = this.ctx.currentTime + 0.03;
      }
      while (this.nextNoteTime < horizon) {
        const theme = this.getCurrentTheme();
        const note = theme.notes[this.melodyIndex % theme.notes.length];
        this.scheduleMusicNote(this.ctx, dest, note, theme.beatSec, theme.timbre, this.nextNoteTime);
        this.nextNoteTime += note.beats * theme.beatSec;
        this.melodyIndex += 1;

        if (this.melodyIndex >= theme.notes.length) {
          this.melodyIndex = 0;
          if (this.autoAlternate) {
            this.themeIndex = getNextThemeIndex(this.themeIndex);
            this.notifyThemeChange();
          }
        }
      }
    };

    tick();
    this.musicTimer = window.setInterval(tick, 100);
  }

  private stopMusicLoop() {
    if (typeof window !== 'undefined' && this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(0, now, 0.05);
    }
  }

  setMuted(muted: boolean) {
    this.sfxMuted = muted;
  }

  isMuted(): boolean {
    return this.sfxMuted;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusicLoop();
    } else {
      this.stopMusicLoop();
    }
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  startMusicIfEnabled() {
    if (this.musicEnabled) {
      this.startMusicLoop();
    }
  }

  getThemes(): readonly ChristmasMusicTheme[] {
    return CHRISTMAS_MUSIC_LIBRARY;
  }

  getCurrentTheme(): ChristmasMusicTheme {
    return CHRISTMAS_MUSIC_LIBRARY[this.themeIndex % CHRISTMAS_MUSIC_LIBRARY.length];
  }

  isAutoAlternate(): boolean {
    return this.autoAlternate;
  }

  setAutoAlternate(enabled: boolean) {
    this.autoAlternate = enabled;
  }

  selectTheme(themeId: string) {
    const idx = CHRISTMAS_MUSIC_LIBRARY.findIndex((t) => t.id === themeId);
    if (idx === -1) return;
    this.themeIndex = idx;
    this.melodyIndex = 0;
    if (this.ctx) {
      this.nextNoteTime = this.ctx.currentTime + 0.05;
    }
    this.notifyThemeChange();
    if (this.musicEnabled) {
      this.startMusicLoop();
    }
  }

  nextTheme() {
    this.themeIndex = getNextThemeIndex(this.themeIndex);
    this.melodyIndex = 0;
    if (this.ctx) {
      this.nextNoteTime = this.ctx.currentTime + 0.05;
    }
    this.notifyThemeChange();
    if (this.musicEnabled) {
      this.startMusicLoop();
    }
  }

  subscribeTheme(listener: (theme: ChristmasMusicTheme) => void): () => void {
    this.themeListeners.add(listener);
    return () => {
      this.themeListeners.delete(listener);
    };
  }

  playClick() {
    const ctx = this.ensureSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  playSpinStart() {
    const ctx = this.ensureSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [330, 440, 554.37];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.035);
      gain.gain.setValueAtTime(0.05, now + i * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.035 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.035);
      osc.stop(now + i * 0.035 + 0.13);
    });
  }

  playReelStop(reelIndex: number, hasScatter = false) {
    const ctx = this.ensureSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Mechanical wooden/brass clack
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = 160 + reelIndex * 18;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.065);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.075);

    // Shimmer ping when a Scatter lands
    if (hasScatter) {
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(880 + reelIndex * 110, now + 0.02);
      chimeGain.gain.setValueAtTime(0.07, now + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chime.start(now + 0.02);
      chime.stop(now + 0.26);
    }
  }

  playWin(isBigWin: boolean) {
    const ctx = this.ensureSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const arpeggio = isBigWin
      ? [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]
      : [523.25, 659.25, 783.99, 1046.5];

    arpeggio.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isBigWin ? 'triangle' : 'sine';
      const t = now + i * 0.075;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(isBigWin ? 0.09 : 0.065, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.34);
    });
  }

  playFreeSpinsTrigger() {
    const ctx = this.ensureSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const fanfare = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51];
    fanfare.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.09;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.095, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.44);
    });
  }
}

export const slotAudio = new SlotAudioEngine();
