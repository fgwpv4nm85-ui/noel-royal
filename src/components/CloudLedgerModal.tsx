import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { LogIn, Trophy, History, X } from 'lucide-react';
import { formatEuro } from '../game/constants';
import { getTranslation, LanguageCode } from '../game/i18n';
import { CloudSpinEntry, LeaderboardEntry } from '../game/cloudSync';

interface CloudLedgerModalProps {
  isOpen: boolean;
  language: LanguageCode;
  user: User | null;
  recentSpins: CloudSpinEntry[];
  leaderboard: LeaderboardEntry[];
  authBusy: boolean;
  onSignIn: () => void;
  onClose: () => void;
}

export const CloudLedgerModal: React.FC<CloudLedgerModalProps> = ({
  isOpen,
  language,
  user,
  recentSpins,
  leaderboard,
  authBusy,
  onSignIn,
  onClose,
}) => {
  const [tab, setTab] = useState<'leaderboard' | 'spins'>('leaderboard');

  if (!isOpen) return null;

  const t = getTranslation(language);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040B08]/85"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ledger-modal-title"
    >
      <div className="w-full max-w-2xl max-h-[86vh] flex flex-col rounded-xl bg-[#101F18] border border-[#D4AF37]/50 text-[#FAF6EE] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/25 bg-[#19110C]">
          <div>
            <h2
              id="ledger-modal-title"
              className="font-display text-xl font-bold tracking-wider text-[#FDE68A]"
            >
              {t.ledgerTitle}
            </h2>
            <p className="text-xs text-[#D6D0C4] mt-0.5">
              {user
                ? t.ledgerCloudSynced(user.displayName || user.email || 'Player')
                : t.ledgerSignInPrompt}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeLedgerAria}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2B1810] hover:bg-[#3F2318] text-[#FDE68A] border border-[#D4AF37]/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tab Controls */}
        <div className="px-6 pt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0B1712] border border-[#D4AF37]/25">
            <button
              type="button"
              onClick={() => setTab('leaderboard')}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                tab === 'leaderboard'
                  ? 'bg-[#F59E0B] text-[#0B1712]'
                  : 'text-[#CBD5E1] hover:text-[#FAF6EE]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{t.hallOfFame}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('spins')}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                tab === 'spins'
                  ? 'bg-[#F59E0B] text-[#0B1712]'
                  : 'text-[#CBD5E1] hover:text-[#FAF6EE]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{t.spinHistory}</span>
            </button>
          </div>

          {!user && (
            <button
              type="button"
              disabled={authBusy}
              onClick={onSignIn}
              className="h-9 px-3.5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] disabled:opacity-50 text-[#FAF6EE] text-xs font-semibold border border-[#FDE68A]/60 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{authBusy ? t.signingIn : t.signInWithGoogle}</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-3">
          {tab === 'leaderboard' ? (
            leaderboard.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#A7B5AD] border border-[#D4AF37]/20 rounded-lg bg-[#0B1712]">
                {t.noLeaderboardYet}
              </div>
            ) : (
              <div className="divide-y divide-[#D4AF37]/15 border border-[#D4AF37]/25 rounded-lg bg-[#0B1712] overflow-hidden">
                {leaderboard.map((entry, idx) => {
                  const isMe = user?.uid === entry.uid;
                  return (
                    <div
                      key={entry.uid}
                      className={`px-4 py-3 flex items-center justify-between gap-4 ${
                        isMe ? 'bg-[#1B3328]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold text-[#FDE68A] w-6 tabular-nums">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#FAF6EE] truncate">
                            {entry.displayName} {isMe ? t.youTag : ''}
                          </div>
                          <div className="text-xs text-[#A7B5AD] tabular-nums">
                            {t.spinsSummaryLine(entry.totalSpins, formatEuro(entry.peakBalance))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] uppercase tracking-wider text-[#A7B5AD]">
                          {t.bestWin}
                        </div>
                        <div className="font-mono text-sm font-bold text-[#FDE047] tabular-nums">
                          {formatEuro(entry.biggestWin)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : !user ? (
            <div className="py-10 px-6 text-center space-y-4 border border-[#D4AF37]/20 rounded-lg bg-[#0B1712]">
              <p className="text-sm text-[#D6D0C4]">
                {t.signInHistoryPrompt}
              </p>
              <button
                type="button"
                disabled={authBusy}
                onClick={onSignIn}
                className="px-5 py-2.5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-[#FAF6EE] text-sm font-semibold border border-[#FDE68A]/60 inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{authBusy ? t.signingIn : t.signInWithGoogle}</span>
              </button>
            </div>
          ) : recentSpins.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#A7B5AD] border border-[#D4AF37]/20 rounded-lg bg-[#0B1712]">
              {t.noCloudSpinsYet}
            </div>
          ) : (
            <div className="divide-y divide-[#D4AF37]/15 border border-[#D4AF37]/25 rounded-lg bg-[#0B1712] overflow-hidden">
              {recentSpins.map((spin) => (
                <div
                  key={spin.id}
                  className="px-4 py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-[#FAF6EE] font-medium truncate">
                      {spin.summary}
                    </div>
                    <div className="text-xs text-[#A7B5AD] tabular-nums mt-0.5">
                      {spin.wasFreeSpin ? t.freeSpinTag : t.betTag(formatEuro(spin.totalBet))} ·{' '}
                      {t.linesTag(spin.activeLines)} · {t.balance} {formatEuro(spin.balanceAfter)}
                    </div>
                  </div>
                  <div
                    className={`font-mono text-sm font-bold tabular-nums shrink-0 ${
                      spin.totalWin > 0 ? 'text-[#FDE047]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {spin.totalWin > 0 ? `+${formatEuro(spin.totalWin)}` : '0.00 €'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
