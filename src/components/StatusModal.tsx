import React from 'react';
import { formatEuro } from '../game/constants';
import { getTranslation, LanguageCode } from '../game/i18n';
import { SessionStats } from '../game/types';

interface StatusModalProps {
  mode: 'paused' | 'gameover';
  language: LanguageCode;
  balance: number;
  stats: SessionStats;
  onResume?: () => void;
  onResetBankroll: () => void;
  onOpenSettings?: () => void;
  onOpenPaytable?: () => void;
  onReturnTitle: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  mode,
  language,
  balance,
  stats,
  onResume,
  onResetBankroll,
  onOpenSettings,
  onOpenPaytable,
  onReturnTitle,
}) => {
  const isGameOver = mode === 'gameover';
  const t = getTranslation(language);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040B08]/85"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-[#101F18] border border-[#D4AF37]/50 text-[#FAF6EE] shadow-2xl overflow-hidden">
        <div className="px-6 py-5 bg-[#19110C] border-b border-[#D4AF37]/25 text-center">
          <h2
            id="status-modal-title"
            className="font-display text-2xl font-bold tracking-wider text-[#FDE68A]"
          >
            {isGameOver ? t.outOfCredits : t.cabinetPaused}
          </h2>
          <p className="text-sm text-[#D6D0C4] mt-1">
            {isGameOver ? t.outOfCreditsDesc : t.pausedDesc}
          </p>
        </div>

        {/* 3 Tabular Stat Tiles */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-[#0B1712] border border-[#D4AF37]/20">
              <div className="text-[11px] uppercase tracking-wider text-[#A7B5AD]">
                {t.balance}
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-[#FAF6EE] tabular-nums whitespace-nowrap mt-1">
                {formatEuro(balance)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#0B1712] border border-[#D4AF37]/20">
              <div className="text-[11px] uppercase tracking-wider text-[#A7B5AD]">
                {t.spinsLabel}
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-[#FAF6EE] tabular-nums whitespace-nowrap mt-1">
                {stats.totalSpins}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#0B1712] border border-[#D4AF37]/20">
              <div className="text-[11px] uppercase tracking-wider text-[#A7B5AD]">
                {t.bestWin}
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-[#FDE68A] tabular-nums whitespace-nowrap mt-1">
                {formatEuro(stats.biggestWin)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {!isGameOver && onResume && (
              <button
                type="button"
                onClick={onResume}
                className="w-full py-3 px-4 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-[#FAF6EE] font-semibold text-base border border-[#F59E0B]/60 transition-colors cursor-pointer"
              >
                {t.resume}
              </button>
            )}

            <button
              type="button"
              data-start={isGameOver ? 'true' : undefined}
              onClick={onResetBankroll}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-base border transition-colors cursor-pointer ${
                isGameOver
                  ? 'bg-[#B91C1C] hover:bg-[#991B1B] text-[#FAF6EE] border-[#F59E0B]/60'
                  : 'bg-[#162920] hover:bg-[#1D352A] text-[#FDE68A] border-[#D4AF37]/35'
              }`}
            >
              {isGameOver ? t.playAgain : t.resetBankroll}
            </button>

            {!isGameOver && onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="w-full py-2.5 px-4 rounded-lg bg-[#162920] hover:bg-[#1D352A] text-[#FAF6EE] font-medium text-sm border border-[#D4AF37]/25 transition-colors cursor-pointer"
              >
                {t.cabinetSettingsMenu}
              </button>
            )}

            {!isGameOver && onOpenPaytable && (
              <button
                type="button"
                onClick={onOpenPaytable}
                className="w-full py-2.5 px-4 rounded-lg bg-[#162920] hover:bg-[#1D352A] text-[#FAF6EE] font-medium text-sm border border-[#D4AF37]/25 transition-colors cursor-pointer"
              >
                {t.paytableMenu}
              </button>
            )}

            <button
              type="button"
              onClick={onReturnTitle}
              className="w-full py-2.5 px-4 rounded-lg bg-transparent hover:bg-white/5 text-[#CBD5E1] font-medium text-sm border border-white/15 transition-colors cursor-pointer"
            >
              {t.titleScreenMenu}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
