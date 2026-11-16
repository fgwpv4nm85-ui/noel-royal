import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import {
  AVAILABLE_LANGUAGES,
  getTranslation,
  LanguageCode,
} from '../game/i18n';

interface LanguageSelectorProps {
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  variant?: 'header' | 'title';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onChangeLanguage,
  variant = 'header',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(language);
  const current =
    AVAILABLE_LANGUAGES.find((l) => l.code === language) ?? AVAILABLE_LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        tabIndex={variant === 'header' ? -1 : undefined}
        data-testid="language-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t.chooseLanguageAria} (${current.nativeName})`}
        title={`${t.languageLabel}: ${current.nativeName}`}
        onClick={(e) => {
          e.currentTarget.blur();
          setOpen((prev) => !prev);
        }}
        className={
          variant === 'title'
            ? 'h-10 px-3 rounded-lg bg-[#19110C]/90 hover:bg-[#2B1810] text-[#FDE68A] border border-[#D4AF37]/40 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-md'
            : 'h-9 sm:h-10 px-2 lg:px-3 rounded-lg bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border border-[#D4AF37]/35 flex items-center justify-center gap-1 sm:gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap'
        }
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span className="font-mono">{current.shortLabel}</span>
        <ChevronDown
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          data-testid="language-menu"
          aria-label={t.languageLabel}
          className="absolute right-0 mt-2 w-48 rounded-xl bg-[#101F18] border border-[#D4AF37]/55 shadow-2xl py-1.5 z-50"
        >
          <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-[#A7B5AD] border-b border-[#D4AF37]/20 mb-1">
            {t.languageLabel}
          </div>
          {AVAILABLE_LANGUAGES.map((opt) => {
            const isActive = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                data-testid={`language-option-${opt.code}`}
                onClick={() => {
                  onChangeLanguage(opt.code);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#19352A] text-[#FDE047] font-semibold'
                    : 'text-[#FAF6EE] hover:bg-[#162920]'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#0B1712] border border-[#D4AF37]/30 text-[#FDE68A]">
                    {opt.shortLabel}
                  </span>
                  <span className="truncate">{opt.nativeName}</span>
                </span>
                {isActive && <Check className="w-3.5 h-3.5 text-[#FDE047] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
