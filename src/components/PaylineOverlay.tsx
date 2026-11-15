import React from 'react';
import { PAYLINES } from '../game/constants';
import { WinningLine } from '../game/types';

interface PaylineOverlayProps {
  winningLines: WinningLine[];
  activeCycleIndex: number;
  previewLineId: number | null;
}

/**
 * 5x3 grid coordinate centers in normalized 1000x600 SVG viewBox:
 * 5 columns -> x = 100, 300, 500, 700, 900
 * 3 rows    -> y = 100, 300, 500
 */
const COL_X = [100, 300, 500, 700, 900];
const ROW_Y = [100, 300, 500];

export const PaylineOverlay: React.FC<PaylineOverlayProps> = ({
  winningLines,
  activeCycleIndex,
  previewLineId,
}) => {
  const previewLine = previewLineId
    ? PAYLINES.find((p) => p.id === previewLineId) ?? null
    : null;

  const displayedWin =
    !previewLine && winningLines.length > 0
      ? winningLines[activeCycleIndex % winningLines.length]
      : null;

  if (!previewLine && !displayedWin) {
    return null;
  }

  const pattern = previewLine ? previewLine.pattern : displayedWin!.pattern;
  const color = previewLine ? previewLine.color : displayedWin!.color;
  const lineId = previewLine ? previewLine.id : displayedWin!.lineId;
  const points = pattern.map((row, col) => `${COL_X[col]},${ROW_Y[row]}`).join(' ');

  return (
    <svg
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      aria-hidden="true"
    >
      {/* Subtle dark halo for crisp contrast against ivory tiles */}
      <polyline
        points={points}
        fill="none"
        stroke="rgba(10, 15, 12, 0.65)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        key={`line-${lineId}-${activeCycleIndex}`}
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-payline-draw"
      />
      {pattern.map((row, col) => {
        const isMatched = displayedWin ? col < displayedWin.matchCount : true;
        return (
          <circle
            key={col}
            cx={COL_X[col]}
            cy={ROW_Y[row]}
            r={isMatched ? 11 : 7}
            fill={isMatched ? color : '#1E293B'}
            stroke="#FAF6EE"
            strokeWidth="3"
            opacity={isMatched ? 1 : 0.75}
          />
        );
      })}
    </svg>
  );
};
