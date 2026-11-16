import React from 'react';
import {
  Globe,
  Music,
  Repeat,
  SkipForward,
  SlidersHorizontal,
  TrendingUp,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import {
  AVAILABLE_LANGUAGES,
  getTranslation,
  LanguageCode,
} from '../game/i18n';
import { ChristmasMusicTheme } from '../game/musicLibrary';
import { VolatilityMode } from '../game/types';

interface SettingsModalProps {
  isOpen: boolean;
  language: LanguageCode;
  volatility: VolatilityMode;
  isSpinning: boolean;
  isMusicOn: boolean;
  isMuted: boolean;
  isTurbo: boolean;
  musicThemes: readonly ChristmasMusicTheme[];
  currentThemeId: string;
  autoAlternateMusic: boolean;
  onChangeLanguage: (lang: LanguageCode) => void;
  onChangeVolatility: (mode: VolatilityMode) => void;
  onToggleMusic: () => void;
  onToggleMute: () => void;
  onToggleTurbo: () => void;
  onSelectMusicTheme: (themeId: string) => void;
  onNextMusicTheme: () => void;
  onToggleAutoAlternateMusic: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  language,
  volatility,
  isMusicOn,
  isMuted,
  isTurbo,
  musicThemes,
  currentThemeId,
  autoAlternateMusic,
  onChangeLanguage,
  onChangeVolatility,
  onToggleMusic,
  onToggleMute,
  onToggleTurbo,
  onSelectMusicTheme,
  onNextMusicTheme,
  onToggleAutoAlternateMusic,
  onClose,
}) => {
  if (!isOpen) return null;

  const t = getTranslation(language);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040B08]/85"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-xl bg-[#101F18] border border-[#D4AF37]/50 text-[#FAF6EE] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/25 bg-[#19110C]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2B1810] border border-[#D4AF37]/40 flex items-center justify-center text-[#FDE68A]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="settings-modal-title"
                className="font-display text-xl font-bold tracking-wider text-[#FDE68A]"
              >
                {t.settingsTitle}
              </h2>
              <p className="text-xs text-[#D6D0C4]">
                {t.settingsSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeSettingsAria}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border border-[#D4AF37]/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Language Picker */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm uppercase tracking-widest text-[#FDE68A] flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t.languageLabel}
              </h3>
              <span className="text-xs font-mono text-[#A7B5AD]">
                {AVAILABLE_LANGUAGES.find((l) => l.code === language)?.nativeName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_LANGUAGES.map((opt) => {
                const isActive = opt.code === language;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    data-testid={`settings-language-${opt.code}`}
                    aria-pressed={isActive}
                    onClick={() => onChangeLanguage(opt.code)}
                    className={`h-10 px-3 rounded-lg border flex items-center justify-between gap-2 text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#19352A] border-[#FDE047]/80 text-[#FDE047]'
                        : 'bg-[#0B1712] hover:bg-[#162920] border-[#D4AF37]/25 text-[#FAF6EE]'
                    }`}
                  >
                    <span className="truncate">{opt.nativeName}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#19110C] border border-[#D4AF37]/30 text-[#FDE68A] shrink-0">
                      {opt.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Volatility Profile */}
          <section className="space-y-3 pt-2 border-t border-[#D4AF37]/20">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm uppercase tracking-widest text-[#FDE68A]">
                {t.volatilityHeading}
              </h3>
              <span className="text-xs font-mono text-[#A7B5AD]">
                {t.higherVariance}
              </span>
            </div>

            <div
              role="radiogroup"
              aria-label={t.volatilityHeading}
              className="grid grid-cols-1 gap-3"
            >
              <button
                type="button"
                role="radio"
                aria-checked={volatility === 'rare'}
                data-testid="volatility-rare"
                onClick={() => onChangeVolatility('rare')}
                className="text-left p-4 rounded-xl border transition-colors cursor-pointer bg-[#3A1414] border-[#FDE047] ring-1 ring-[#FDE047]/60 shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-sm text-[#FAF6EE]">
                    <TrendingUp className="w-4 h-4 text-[#FDE047]" />
                    {t.rareBigWins}
                  </span>
                  <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 border-[#FDE047] bg-[#FDE047]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0B1712]" />
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#D6D0C4] leading-relaxed">
                  {t.rareBigWinsDesc}
                </p>
              </button>
            </div>
          </section>

          {/* Audio & Speed Quick Controls */}
          <section className="space-y-2.5 pt-2 border-t border-[#D4AF37]/20">
            <h3 className="font-display text-sm uppercase tracking-widest text-[#FDE68A]">
              {t.audioAndSpeed}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                aria-pressed={isMusicOn}
                onClick={onToggleMusic}
                className={`h-11 px-3 rounded-lg border flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                  isMusicOn
                    ? 'bg-[#19352A] border-[#F59E0B]/60 text-[#FDE047]'
                    : 'bg-[#0B1712] border-[#D4AF37]/25 text-[#94A3B8]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Music className="w-4 h-4" />
                  {t.music}
                </span>
                <span>{isMusicOn ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                aria-pressed={!isMuted}
                onClick={onToggleMute}
                className={`h-11 px-3 rounded-lg border flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                  !isMuted
                    ? 'bg-[#2B1810] border-[#D4AF37]/45 text-[#FDE68A]'
                    : 'bg-[#0B1712] border-[#D4AF37]/25 text-[#94A3B8]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {t.sfx}
                </span>
                <span>{!isMuted ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                aria-pressed={isTurbo}
                onClick={onToggleTurbo}
                className={`h-11 px-3 rounded-lg border flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                  isTurbo
                    ? 'bg-[#F59E0B] border-[#FEF3C7] text-[#0B1712]'
                    : 'bg-[#0B1712] border-[#D4AF37]/25 text-[#CBD5E1]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  {t.turbo}
                </span>
                <span>{isTurbo ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </section>

          {/* Alternating Christmas Music Library */}
          <section className="space-y-3 pt-2 border-t border-[#D4AF37]/20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm uppercase tracking-widest text-[#FDE68A]">
                {t.musicLibraryTitle(musicThemes.length)}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="music-alternate-toggle"
                  aria-pressed={autoAlternateMusic}
                  onClick={onToggleAutoAlternateMusic}
                  className={`h-9 px-3 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    autoAlternateMusic
                      ? 'bg-[#19352A] border-[#F59E0B]/60 text-[#FDE047]'
                      : 'bg-[#0B1712] border-[#D4AF37]/25 text-[#94A3B8]'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>{t.alternance} {autoAlternateMusic ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  data-testid="music-next-button"
                  onClick={onNextMusicTheme}
                  aria-label={t.nextTrack}
                  className="h-9 px-3 rounded-lg bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border border-[#D4AF37]/40 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>{t.nextTrack}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {musicThemes.map((theme, idx) => {
                const isActive = theme.id === currentThemeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    data-testid={`music-theme-${theme.id}`}
                    aria-pressed={isActive}
                    onClick={() => onSelectMusicTheme(theme.id)}
                    className={`text-left px-3 py-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-[#19352A] border-[#FDE047]/80 text-[#FAF6EE]'
                        : 'bg-[#0B1712] hover:bg-[#162920] border-[#D4AF37]/20 text-[#D6D0C4]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate text-[#FAF6EE]">
                        {idx + 1}. {theme.title}
                      </div>
                      <div className="text-[11px] text-[#A7B5AD] truncate">
                        {theme.subtitle}
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#FDE047] shrink-0">
                        {t.activeTrack}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#19110C] border-t border-[#D4AF37]/25 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-[#FAF6EE] font-semibold text-sm border border-[#F59E0B]/60 transition-colors cursor-pointer"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};
