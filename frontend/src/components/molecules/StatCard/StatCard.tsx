import type { ComponentType, ReactNode } from 'react';
import { Box, Group, Paper, Text } from '@mantine/core';
import type { IconProps } from '@/components/atoms/Icon';
import { IconChip, type IconChipTone } from '@/components/atoms/IconChip';
import { Sparkline } from '@/components/atoms/Sparkline/Sparkline';

export type StatCardTone = IconChipTone;

interface StatCardProps {
  icon: ComponentType<IconProps>;
  label: string;
  /** Valor principal (número/texto grande). */
  value?: ReactNode;
  /** Sufixo curto ao lado do valor (ex.: "versões", "/ 10"). */
  unit?: string;
  tone?: StatCardTone;
  /** Série pro mini-gráfico no canto (≥ 2 pontos reais; omitido se ausente). */
  spark?: number[];
  /** Cor do sparkline (hex). Default terracotta da IDV. */
  sparkColor?: string;
  /** Conteúdo do rodapé, separado por um divisor. */
  foot?: ReactNode;
  /** Conteúdo principal alternativo (substitui value/unit) — ex.: placeholder. */
  children?: ReactNode;
}

/**
 * Card de métrica do dashboard (porte do `StatCard` do protótipo): chip de
 * ícone com gradiente sutil, label, valor grande + unidade e rodapé opcional.
 * Genérico, sem lógica de domínio.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  tone = 'terracotta',
  spark,
  sparkColor,
  foot,
  children,
}: StatCardProps) {
  return (
    <Paper withBorder radius="lg" p="lg" h="100%">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <IconChip icon={Icon} tone={tone} size={44} iconSize={20} />
        {spark && spark.length >= 2 && (
          <Sparkline data={spark} color={sparkColor} />
        )}
      </Group>

      <Text fz={13} fw={600} c="dimmed" mt="md">
        {label}
      </Text>

      {children ?? (
        <Group gap={6} align="baseline" mt={4} wrap="nowrap">
          <Text
            fz={30}
            fw={800}
            lh={1}
            c="var(--mantine-color-text)"
            style={{ letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}
          >
            {value}
          </Text>
          {unit && (
            <Text fz="sm" fw={600} c="dimmed">
              {unit}
            </Text>
          )}
        </Group>
      )}

      {foot && (
        <Box
          mt="md"
          pt="md"
          style={{
            borderTop:
              '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-4))',
          }}
        >
          {foot}
        </Box>
      )}
    </Paper>
  );
}
