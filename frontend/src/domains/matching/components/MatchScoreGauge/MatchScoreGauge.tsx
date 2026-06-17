import { useId } from 'react';
import { Box, Text } from '@mantine/core';
import { matchTone, type MatchTone } from '../../types';

interface MatchScoreGaugeProps {
  /** Percentual inteiro 0–100 (já convertido do score 0–1). */
  percent: number;
  size?: number;
  thickness?: number;
}

/** Pares de gradiente por tom (espelha o `ScoreGauge` do protótipo). */
const GRADIENT: Record<MatchTone, [string, string]> = {
  green: ['#69db7c', '#2f9e44'],
  yellow: ['#ffd43b', '#f08c00'],
  red: ['#ff8787', '#e03131'],
};

/**
 * Anel de aderência com gradiente + numeral mono central e sufixo `%` (porte SVG
 * fiel do `ScoreGauge` do protótipo, variante `max=100`). Próprio do domain —
 * NÃO importa o ScoreGauge do resume. Cor por faixa: verde ≥ 75, amarelo ≥ 50.
 */
export function MatchScoreGauge({
  percent,
  size = 140,
  thickness = 11,
}: MatchScoreGaugeProps) {
  const id = useId();
  const clamped = Math.max(0, Math.min(100, percent));
  const pct = clamped / 100;
  const r = size / 2 - thickness / 2 - 2;
  const circumference = 2 * Math.PI * r;
  const tone = matchTone(clamped);
  const [from, to] = GRADIENT[tone];

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
          {clamped}
          <Text span c="dimmed" style={{ fontSize: size * 0.13 }}>
            %
          </Text>
        </Text>
      </Box>
    </Box>
  );
}
