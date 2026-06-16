import { useId } from 'react';
import { Box, Text } from '@mantine/core';
import { scoreTone, type FeedbackTone } from '../../types';

interface ScoreGaugeProps {
  /** Nota 0–10. */
  score: number;
  max?: number;
  size?: number;
  thickness?: number;
}

/** Pares de gradiente por tom (espelha o ScoreGauge do protótipo). */
const GRADIENT: Record<FeedbackTone, [string, string]> = {
  green: ['#69db7c', '#2f9e44'],
  yellow: ['#ffd43b', '#f08c00'],
  red: ['#ff8787', '#e03131'],
};

/**
 * Anel de score com gradiente + numeral mono central (porte SVG fiel do
 * `ScoreGauge` do protótipo). Cor por faixa: verde ≥ 7.5, amarelo ≥ 5, vermelho.
 */
export function ScoreGauge({
  score,
  max = 10,
  size = 150,
  thickness = 11,
}: ScoreGaugeProps) {
  const id = useId();
  const pct = Math.max(0, Math.min(1, score / max));
  const r = size / 2 - thickness / 2 - 2;
  const circumference = 2 * Math.PI * r;
  const tone = scoreTone(score);
  const [from, to] = GRADIENT[tone];
  const display = score.toFixed(1);

  return (
    <Box style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        aria-hidden
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="light-dark(#eceef5, var(--mantine-color-dark-4))"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(.2,.7,.3,1)',
            filter: `drop-shadow(0 2px 5px ${to}55)`,
          }}
        />
      </svg>
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          ff="monospace"
          fw={600}
          lh={1}
          c="var(--mantine-color-text)"
          style={{ fontSize: size * 0.28, letterSpacing: '-0.02em' }}
        >
          {display}
          <Text span c="dimmed" style={{ fontSize: size * 0.13 }}>
            /10
          </Text>
        </Text>
      </Box>
    </Box>
  );
}
