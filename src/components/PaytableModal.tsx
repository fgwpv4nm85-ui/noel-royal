import React, { useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { formatEuro, PAYLINES, PROGRESSIVE_SEED, SYMBOL_ORDER, SYMBOLS } from '../game/constants';
import { getTranslation, LanguageCode } from '../game/i18n';
import { SlotSymbolArt } from './SlotSymbolArt';

interface PaytableModalProps {
  isOpen: boolean;
  language: LanguageCode;
  betPerLine: number;
  activeLines: number;
  progressiveJackpot: number;
  onClose: () => void;
}

export const PaytableModal: React.FC<PaytableModalProps> = ({
  isOpen,
  language,
  betPerLine,
  activeLines,
  progressiveJackpot,
  onClose,
}) => {
  const [selectedLineId, setSelectedLineId] = useState<number>(2);

  if (!isOpen) return null;

  const t = getTranslation(language);
  const totalBet = betPerLine * activeLines;
  const inspectedLine = PAYLINES.find((l) => l.id === selectedLineId) ?? PAYLINES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040B08]/85"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paytable-title"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-xl bg-[#101F18] border border-[#D4AF37]/45 text-[#FAF6EE] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/25 bg-[#19110C]">
          <div>
            <h2
              id="paytable-title"
              className="font-display text-xl sm:text-2xl font-bold tracking-wider text-[#FDE68A]"
            >
              {t.paytableTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#D6D0C4] mt-0.5 tabular-nums">
              {t.paytableStakeLine(formatEuro(betPerLine), activeLines, formatEuro(totalBet))}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closePaytableAria}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border border-[#D4AF37]/30 transition-colors duration-150 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-8">
          {/* Progressive Jackpot Banner */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#2B1810] via-[#3A1914] to-[#2B1810] border border-[#F59E0B]/60 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#19110C] border border-[#FDE68A]/50 flex items-center justify-center shrink-0 text-[#FDE047]">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold tracking-wide text-[#FDE68A]">
                  {t.jackpotBannerTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#E2DDD3] mt-0.5 leading-snug">
                  {t.jackpotBannerDesc(formatEuro(PROGRESSIVE_SEED))}
                </p>
              </div>
            </div>
            <div className="shrink-0 px-4 py-2.5 rounded-lg bg-[#0B1712] border border-[#F59E0B]/50 text-right">
              <div className="text-[10px] uppercase tracking-widest text-[#D6D0C4]">
                {t.currentJackpot}
              </div>
              <div className="font-mono text-xl font-bold text-[#FDE047] tabular-nums whitespace-nowrap">
                {formatEuro(progressiveJackpot)}
              </div>
            </div>
          </section>

          {/* Special Symbols Rules */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[#162920] border border-[#D4AF37]/25">
              <SlotSymbolArt symbolId="WILD" label={t.symbols.WILD} className="w-16 h-16 shrink-0" />
              <div>
                <h3 className="font-display text-base font-bold text-[#FDE68A]">
                  {t.wildRuleTitle}
                </h3>
                <p className="text-sm text-[#E2DDD3] mt-1 leading-snug">
                  {t.wildRuleDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-[#162920] border border-[#D4AF37]/25">
              <SlotSymbolArt symbolId="SCATTER" label={t.symbols.SCATTER} className="w-16 h-16 shrink-0" />
              <div>
                <h3 className="font-display text-base font-bold text-[#FDE68A]">
                  {t.scatterRuleTitle}
                </h3>
                <p className="text-sm text-[#E2DDD3] mt-1 leading-snug">
                  {t.scatterRuleDesc}
                </p>
              </div>
            </div>
          </section>

          {/* Symbol Payouts Grid */}
          <section>
            <h3 className="font-display text-sm uppercase tracking-widest text-[#FDE68A]/90 mb-3">
              {t.symbolPayoutsHeading}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SYMBOL_ORDER.map((id) => {
                const sym = SYMBOLS[id];
                const localizedName = t.symbols[id] ?? sym.name;
                const unit = sym.isScatter ? totalBet : betPerLine;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-3.5 p-3 rounded-lg bg-[#0B1712] border border-[#D4AF37]/20"
                  >
                    <SlotSymbolArt symbolId={id} label={localizedName} className="w-14 h-14 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-[#FAF6EE] truncate">
                        {localizedName}
                      </div>
                      <div className="text-xs text-[#A7B5AD] mb-1">
                        {sym.isScatter ? t.multipliesTotalBet : t.multipliesBetPerLine}
                      </div>
                      <div className="font-mono text-xs tabular-nums space-y-0.5 text-[#FDE68A]">
                        <div className="flex justify-between">
                          <span className="text-[#CBD5E1]">5×</span>
                          <span>{formatEuro(sym.payouts[5] * unit)} ({sym.payouts[5]}×)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#CBD5E1]">4×</span>
                          <span>{formatEuro(sym.payouts[4] * unit)} ({sym.payouts[4]}×)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#CBD5E1]">3×</span>
                          <span>{formatEuro(sym.payouts[3] * unit)} ({sym.payouts[3]}×)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Interactive 50 Paylines Map */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-display text-sm uppercase tracking-widest text-[#FDE68A]/90">
                {t.paylinesHeading}
              </h3>
              <span className="text-xs font-mono text-[#FDE68A] tabular-nums">
                {t.inspectingLabel} {inspectedLine.name} [{inspectedLine.pattern.join(',')}]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-center p-4 rounded-lg bg-[#0B1712] border border-[#D4AF37]/20">
              {/* Mini 5x3 visual preview */}
              <div className="grid grid-cols-5 gap-1.5 p-3 rounded-lg bg-[#162920] border border-[#D4AF37]/30">
                {[0, 1, 2].map((row) =>
                  [0, 1, 2, 3, 4].map((col) => {
                    const isActiveCell = inspectedLine.pattern[col] === row;
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`h-9 rounded flex items-center justify-center text-xs font-mono font-bold transition-colors ${
                          isActiveCell
                            ? 'text-[#0B1712]'
                            : 'bg-[#0B1712]/70 text-[#64748B]'
                        }`}
                        style={
                          isActiveCell
                            ? { backgroundColor: inspectedLine.color }
                            : undefined
                        }
                      >
                        {isActiveCell ? col + 1 : '·'}
                      </div>
                    );
                  }),
                )}
              </div>

              {/* 50 selectable line buttons */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {PAYLINES.map((line) => {
                  const isSelected = line.id === inspectedLine.id;
                  const isLineEnabled = line.id <= activeLines;
                  return (
                    <button
                      key={line.id}
                      type="button"
                      onClick={() => setSelectedLineId(line.id)}
                      className={`h-10 rounded font-mono text-xs font-semibold tabular-nums transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#F59E0B] text-[#0B1712] border-[#FEF3C7]'
                          : isLineEnabled
                            ? 'bg-[#162920] text-[#FAF6EE] border-[#D4AF37]/30 hover:border-[#FDE68A]'
                            : 'bg-[#09120E] text-[#64748B] border-white/10'
                      }`}
                      aria-label={`${t.inspectingLabel} ${line.name}`}
                    >
                      {line.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
