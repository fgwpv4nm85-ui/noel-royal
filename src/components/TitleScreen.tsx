import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import titleBgUrl from '../assets/images/title_bg_1794724369989.jpg';
import { getTranslation, LanguageCode } from '../game/i18n';
import { LanguageSelector } from './LanguageSelector';

interface TitleScreenProps {
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  onStart: () => void;
  onOpenPaytable: () => void;
  user: User | null;
  authBusy: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  language,
  onChangeLanguage,
  onStart,
  onOpenPaytable,
  user,
  authBusy,
  onSignIn,
  onSignOut,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const t = getTranslation(language);

  return (
    <div className="relative w-full h-screen min-h-[600px] overflow-hidden bg-[#07120E] text-[#FAF6EE] flex flex-col justify-between">
      {/* Illustrated Key-Art Backdrop */}
      {!imgFailed ? (
        <img
          src={titleBgUrl}
          alt="Alpine winter lodge parlor by night"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.06] select-none pointer-events-none"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,#3B1F12_0%,#0B1914_55%,#050C09_100%)]"
          aria-hidden="true"
        />
      )}

      {/* Measured contrast scrim over the left negative space */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#06110D]/92 via-[#06110D]/72 to-[#06110D]/20 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050C09]/90 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Top-right Language Selector */}
      <div className="relative z-20 flex justify-end px-6 sm:px-12 lg:px-20 pt-5">
        <LanguageSelector
          language={language}
          onChangeLanguage={onChangeLanguage}
          variant="title"
        />
      </div>

      {/* Main Content anchored in the left 45% negative-space region */}
      <main className="relative z-10 flex-1 flex items-center px-6 sm:px-12 lg:px-20 max-w-4xl">
        <div className="flex flex-col items-start gap-7 max-w-xl">
          {/* Bespoke inline SVG Title Crest Emblem */}
          <svg
            viewBox="0 0 460 156"
            className="w-full max-w-[440px] h-auto drop-shadow-[0_6px_18px_rgba(0,0,0,0.65)]"
            role="img"
            aria-label={`Noël Royale — ${t.titleSubtitle}`}
          >
            <defs>
              <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF3C7" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>

            {/* Ornamental top star & pine filigree */}
            <line x1="60" y1="24" x2="195" y2="24" stroke="url(#crestGold)" strokeWidth="1.5" opacity="0.7" />
            <line x1="265" y1="24" x2="400" y2="24" stroke="url(#crestGold)" strokeWidth="1.5" opacity="0.7" />
            <path
              d="M230 6 L234.5 18.5 L247 23 L234.5 27.5 L230 40 L225.5 27.5 L213 23 L225.5 18.5 Z"
              fill="url(#crestGold)"
            />

            {/* Primary Display Wordmark */}
            <text
              x="230"
              y="92"
              textAnchor="middle"
              fill="#FAF6EE"
              fontFamily="Cinzel, Georgia, serif"
              fontSize="54"
              fontWeight="800"
              letterSpacing="4"
            >
              NOËL ROYALE
            </text>

            {/* Subtitle & Gold Frame Rule */}
            <line x1="36" y1="112" x2="424" y2="112" stroke="url(#crestGold)" strokeWidth="1.5" opacity="0.85" />
            <text
              x="230"
              y="138"
              textAnchor="middle"
              fill="#FDE68A"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontSize="14"
              fontWeight="600"
              letterSpacing="3.5"
            >
              {t.titleSubtitle}
            </text>
          </svg>

          <p className="text-base sm:text-lg text-[#E2DDD3] leading-relaxed max-w-md font-normal">
            {t.titleDescription}
          </p>

          {/* Primary & Secondary Actions */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <button
              type="button"
              data-start="true"
              onClick={onStart}
              className="px-8 py-3.5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] active:scale-[0.98] text-[#FAF6EE] font-semibold text-base tracking-wide border border-[#F59E0B]/70 shadow-[0_6px_20px_rgba(0,0,0,0.45)] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE68A] cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.play}
            </button>

            <button
              type="button"
              onClick={onOpenPaytable}
              className="px-6 py-3.5 rounded-lg bg-[#12261E]/90 hover:bg-[#19352A] active:scale-[0.98] text-[#FDE68A] font-medium text-base border border-[#D4AF37]/40 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDE68A] cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.paytable}
            </button>

            {user ? (
              <button
                type="button"
                disabled={authBusy}
                onClick={onSignOut}
                className="px-5 py-3.5 rounded-lg bg-[#19110C]/90 hover:bg-[#2B1810] disabled:opacity-50 text-[#E2DDD3] font-medium text-sm border border-[#D4AF37]/30 transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0"
              >
                {user.displayName ? `${user.displayName.split(' ')[0]} · ${t.signOut}` : t.signOut}
              </button>
            ) : (
              <button
                type="button"
                disabled={authBusy}
                onClick={onSignIn}
                className="px-5 py-3.5 rounded-lg bg-[#19110C]/90 hover:bg-[#2B1810] disabled:opacity-50 text-[#FDE68A] font-medium text-sm border border-[#D4AF37]/30 transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0"
              >
                {authBusy ? t.signingIn : t.signInToSave}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Single flat, borderless control hint line in bottom safe margin */}
      <footer className="relative z-10 px-6 sm:px-12 lg:px-20 pb-6">
        <p className="text-xs sm:text-sm text-[#CBD5E1]/80 tracking-wide font-medium">
          {t.titleFooterHints}
        </p>
      </footer>
    </div>
  );
};
