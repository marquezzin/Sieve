import type { ComponentType } from 'react';
import { Box } from '@mantine/core';
import type { IconProps } from '@/components/atoms/Icon';
import classes from './IconChip.module.css';

/** Tons disponíveis para o chip de ícone (espelha os tons do protótipo). */
export type IconChipTone = 'terracotta' | 'blue' | 'violet' | 'green' | 'gray';

interface IconChipProps {
  /** Ícone (componente de `@/components/atoms/Icon`). */
  icon: ComponentType<IconProps>;
  /** Tom de cor do chip. */
  tone?: IconChipTone;
  /** Tamanho do quadradinho (lado, px). 44 nos StatCards, 36 nas atividades. */
  size?: number;
  /** Tamanho do ícone (px). Default proporcional ao chip. */
  iconSize?: number;
}

/**
 * Chip de ícone "texturizado" — quadradinho com gradiente sutil, ring interna
 * da cor do tom e sombra leve, com o ícone no tom. Funciona em light e dark.
 * Porte fiel do tratamento de chip do protótipo (StatCard / ResumeRow /
 * Atividade recente). Genérico, sem lógica de domínio.
 *
 * O gradiente/tint por tom vive em `IconChip.module.css` (regras CSS de verdade,
 * dark via `[data-mantine-color-scheme='dark']`) — gradiente NÃO pode ir num
 * `light-dark()` inline (essa função só aceita <color>; um gradiente ali torna a
 * regra inválida e o chip fica branco).
 */
export function IconChip({
  icon: Icon,
  tone = 'terracotta',
  size = 44,
  iconSize,
}: IconChipProps) {
  const resolvedIconSize = iconSize ?? Math.round(size * 0.45);

  return (
    <Box
      className={`${classes.chip} ${classes[tone]}`}
      style={{ width: size, height: size }}
    >
      <Icon size={resolvedIconSize} />
    </Box>
  );
}
