import { useId } from 'react';

interface SparklineProps {
  /** Série de valores (≥ 2 pontos). */
  data: number[];
  width?: number;
  height?: number;
  /** Cor da linha/área (hex ou CSS color). Default terracotta da IDV. */
  color?: string;
}

/**
 * Mini-gráfico de linha (porte do `Sparkline` do protótipo): linha + área em
 * gradiente + ponto final. Decorativo; recebe a série já pronta. Átomo sem
 * lógica de domínio. Precisa de ≥ 2 pontos pra desenhar.
 */
export function Sparkline({
  data,
  width = 96,
  height = 34,
  color = '#cf5530',
}: SparklineProps) {
  const gradientId = useId();

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 4 - ((v - min) / span) * (height - 8);
    return [x, y] as const;
  });

  const line = points
    .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  const last = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      style={{ overflow: 'visible', flexShrink: 0 }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={2.6} fill={color} />
    </svg>
  );
}
