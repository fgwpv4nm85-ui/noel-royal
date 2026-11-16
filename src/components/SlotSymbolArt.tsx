import React, { useId } from 'react';
import { SYMBOLS } from '../game/constants';
import { SymbolId } from '../game/types';

interface SlotSymbolArtProps {
  symbolId: SymbolId;
  className?: string;
  compact?: boolean;
  label?: string;
}

export const SlotSymbolArt: React.FC<SlotSymbolArtProps> = ({
  symbolId,
  className = 'w-16 h-16',
  compact = false,
  label,
}) => {
  const def = SYMBOLS[symbolId];
  const uid = useId().replace(/:/g, '');
  const goldRimId = `goldRim-${uid}`;
  const crimsonGradId = `crimsonGrad-${uid}`;
  const pineGradId = `pineGrad-${uid}`;

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      aria-label={label ?? def.name}
    >
      <svg
        viewBox="0 0 80 80"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={goldRimId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id={crimsonGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
          <linearGradient id={pineGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>
        </defs>

        {symbolId === 'WILD' && (
          <g>
            {/* Gold crest ring */}
            <circle cx="40" cy="36" r="30" fill="#7F1D1D" stroke={`url(#${goldRimId})`} strokeWidth="3.5" />
            {/* Santa hat */}
            <path d="M22 30 C24 14, 48 11, 58 26 L54 32 L22 32 Z" fill={`url(#${crimsonGradId})`} stroke="#450A0A" strokeWidth="2" />
            <circle cx="60" cy="27" r="5" fill="#FAF6EE" stroke="#CBD5E1" strokeWidth="1.5" />
            <rect x="20" y="29" width="38" height="7" rx="3.5" fill="#FAF6EE" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Face & beard */}
            <circle cx="40" cy="41" r="11" fill="#FDE6D2" stroke="#78350F" strokeWidth="1.5" />
            <path d="M26 42 C26 57, 54 57, 54 42 C49 46, 31 46, 26 42 Z" fill="#FAF6EE" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="36" cy="39" r="1.7" fill="#1E293B" />
            <circle cx="44" cy="39" r="1.7" fill="#1E293B" />
            <circle cx="40" cy="42.5" r="2.2" fill="#DC2626" />
            {/* WILD banner */}
            {!compact && (
              <g>
                <rect x="15" y="56" width="50" height="16" rx="4" fill="#991B1B" stroke={`url(#${goldRimId})`} strokeWidth="2" />
                <text
                  x="40"
                  y="67.5"
                  textAnchor="middle"
                  fill="#FEF3C7"
                  fontSize="10.5"
                  fontWeight="800"
                  fontFamily="Cinzel, serif"
                  letterSpacing="1.2"
                >
                  WILD
                </text>
              </g>
            )}
          </g>
        )}

        {symbolId === 'SCATTER' && (
          <g>
            <circle cx="40" cy="37" r="29" fill="#1E1B4B" stroke={`url(#${goldRimId})`} strokeWidth="3" />
            {/* North Star rays */}
            <path d="M40 9 L45 31 L67 36 L45 41 L40 63 L35 41 L13 36 L35 31 Z" fill={`url(#${goldRimId})`} stroke="#78350F" strokeWidth="1.5" />
            <path d="M40 16 L43 33 L60 36 L43 39 L40 56 L37 39 L20 36 L37 33 Z" fill="#FEF08A" />
            <circle cx="40" cy="36" r="4.5" fill="#FFFFFF" />
            {!compact && (
              <g>
                <rect x="10" y="57" width="60" height="15" rx="4" fill="#0F172A" stroke={`url(#${goldRimId})`} strokeWidth="1.8" />
                <text
                  x="40"
                  y="67.5"
                  textAnchor="middle"
                  fill="#FDE68A"
                  fontSize="9"
                  fontWeight="800"
                  fontFamily="Cinzel, serif"
                  letterSpacing="0.9"
                >
                  SCATTER
                </text>
              </g>
            )}
          </g>
        )}

        {symbolId === 'GIFT' && (
          <g>
            {/* Box body */}
            <rect x="17" y="30" width="46" height="36" rx="4" fill={`url(#${crimsonGradId})`} stroke="#450A0A" strokeWidth="2" />
            {/* Lid */}
            <rect x="14" y="22" width="52" height="11" rx="3" fill="#EF4444" stroke="#450A0A" strokeWidth="2" />
            {/* Gold vertical & horizontal ribbon */}
            <rect x="35.5" y="22" width="9" height="44" fill={`url(#${goldRimId})`} stroke="#78350F" strokeWidth="1" />
            <rect x="17" y="43" width="46" height="7" fill={`url(#${goldRimId})`} stroke="#78350F" strokeWidth="1" />
            {/* Bow */}
            <path d="M40 22 C30 10, 20 16, 28 22 Z" fill="#FDE68A" stroke="#92400E" strokeWidth="1.8" />
            <path d="M40 22 C50 10, 60 16, 52 22 Z" fill="#FDE68A" stroke="#92400E" strokeWidth="1.8" />
            <circle cx="40" cy="22" r="4" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
          </g>
        )}

        {symbolId === 'TREE' && (
          <g>
            <rect x="34" y="58" width="12" height="11" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="1.8" />
            <polygon points="40,14 19,36 61,36" fill={`url(#${pineGradId})`} stroke="#052E16" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="40,24 15,49 65,49" fill={`url(#${pineGradId})`} stroke="#052E16" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="40,34 12,60 68,60" fill={`url(#${pineGradId})`} stroke="#052E16" strokeWidth="2" strokeLinejoin="round" />
            {/* Star topper & ornaments */}
            <polygon points="40,6 42,12 48,12 43,15.5 45,21 40,17.5 35,21 37,15.5 32,12 38,12" fill="#FDE047" stroke="#92400E" strokeWidth="1.2" />
            <circle cx="35" cy="34" r="3" fill="#EF4444" />
            <circle cx="46" cy="43" r="3" fill="#FDE047" />
            <circle cx="30" cy="52" r="3" fill="#38BDF8" />
            <circle cx="51" cy="54" r="3" fill="#EF4444" />
          </g>
        )}

        {symbolId === 'BELL' && (
          <g>
            {/* Holly leaves */}
            <path d="M24 20 C16 14, 14 26, 24 26 Z" fill="#15803D" stroke="#052E16" strokeWidth="1.5" />
            <path d="M56 20 C64 14, 66 26, 56 26 Z" fill="#15803D" stroke="#052E16" strokeWidth="1.5" />
            <circle cx="40" cy="17" r="4" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />
            {/* Golden bell */}
            <path
              d="M40 19 C26 19, 23 36, 19 49 L14 57 L66 57 L61 49 C57 36, 54 19, 40 19 Z"
              fill={`url(#${goldRimId})`}
              stroke="#78350F"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path d="M31 28 C28 34, 27 42, 24 49" stroke="#FEF9C3" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="40" cy="61" r="6" fill="#D97706" stroke="#78350F" strokeWidth="2" />
          </g>
        )}

        {symbolId === 'REINDEER' && (
          <g>
            {/* Antlers */}
            <path d="M30 27 L20 13 M24 19 L17 19 M27 23 L29 15" stroke="#78350F" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M50 27 L60 13 M56 19 L63 19 M53 23 L51 15" stroke="#78350F" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            {/* Ears */}
            <ellipse cx="22" cy="33" rx="6" ry="3.5" transform="rotate(-20 22 33)" fill="#92400E" stroke="#451A03" strokeWidth="1.5" />
            <ellipse cx="58" cy="33" rx="6" ry="3.5" transform="rotate(20 58 33)" fill="#92400E" stroke="#451A03" strokeWidth="1.5" />
            {/* Head */}
            <ellipse cx="40" cy="43" rx="16" ry="18" fill="#B45309" stroke="#451A03" strokeWidth="2" />
            <ellipse cx="40" cy="52" rx="12" ry="10" fill="#FDE6D2" />
            {/* Eyes & bright red nose */}
            <circle cx="33" cy="38" r="2.3" fill="#1E293B" />
            <circle cx="47" cy="38" r="2.3" fill="#1E293B" />
            <circle cx="40" cy="50" r="5" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />
            <circle cx="38.5" cy="48.5" r="1.4" fill="#FCA5A5" />
          </g>
        )}

        {symbolId === 'SNOWMAN' && (
          <g>
            {/* Bottom & head */}
            <circle cx="40" cy="54" r="15" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
            <circle cx="40" cy="33" r="11" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
            {/* Scarf */}
            <path d="M29 41 Q40 46 51 41 L51 46 Q40 50 29 46 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.2" />
            <path d="M44 44 L50 56 L44 58 L40 46 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.2" />
            {/* Top hat */}
            <rect x="27" y="21" width="26" height="4" rx="2" fill="#1E293B" />
            <rect x="31" y="10" width="18" height="12" rx="2" fill="#1E293B" />
            <rect x="31" y="18" width="18" height="3" fill="#DC2626" />
            {/* Face & carrot nose */}
            <circle cx="36" cy="31" r="1.8" fill="#0F172A" />
            <circle cx="44" cy="31" r="1.8" fill="#0F172A" />
            <polygon points="40,33 50,35 40,37" fill="#F97316" stroke="#9A3412" strokeWidth="1" />
            {/* Buttons */}
            <circle cx="40" cy="52" r="1.8" fill="#0F172A" />
            <circle cx="40" cy="58" r="1.8" fill="#0F172A" />
          </g>
        )}

        {symbolId === 'STOCKING' && (
          <g>
            <path
              d="M28 21 L50 21 L50 45 C50 54, 42 64, 28 64 C20 64, 17 57, 21 51 C24 47, 28 45, 28 40 Z"
              fill={`url(#${crimsonGradId})`}
              stroke="#450A0A"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Toe & heel */}
            <path d="M21 51 C17 57, 20 64, 28 64 L31 64 C26 59, 25 54, 26 49 Z" fill="#FDE68A" opacity="0.85" />
            {/* White cuff */}
            <rect x="25" y="14" width="28" height="11" rx="4" fill="#FAF6EE" stroke="#94A3B8" strokeWidth="1.8" />
            {/* Gold stripe */}
            <line x1="28" y1="34" x2="50" y2="34" stroke="#FDE047" strokeWidth="3" />
          </g>
        )}

        {symbolId === 'CANDY' && (
          <g transform="rotate(-14 40 40)">
            {/* Candy cane */}
            <path
              d="M32 65 L32 30 C32 18, 52 18, 52 30"
              fill="none"
              stroke="#FAF6EE"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M32 65 L32 30 C32 18, 52 18, 52 30"
              fill="none"
              stroke="#DC2626"
              strokeWidth="12"
              strokeDasharray="7 8"
              strokeLinecap="butt"
            />
            <path
              d="M32 65 L32 30 C32 18, 52 18, 52 30"
              fill="none"
              stroke="#450A0A"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.35"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
