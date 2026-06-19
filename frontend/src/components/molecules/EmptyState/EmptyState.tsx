import type { ComponentType, ReactNode } from 'react';
import { Box, Stack, Text } from '@mantine/core';
import type { IconProps } from '@/components/atoms/Icon';
import { IconChip, type IconChipTone } from '@/components/atoms/IconChip';

interface EmptyStateProps {
  /** Ícone (componente de `@/components/atoms/Icon`). */
  icon?: ComponentType<IconProps>;
  /** Tom do chip de ícone. Default terracotta da IDV. */
  tone?: IconChipTone;
  title: string;
  description?: ReactNode;
  /** Ação opcional (geralmente um `<Button>`). */
  action?: ReactNode;
}

/**
 * Estado vazio reutilizável (porte do `EmptyState` do protótipo `ui.jsx`):
 * chip de ícone com gradiente sutil, título, descrição e ação opcional.
 * Genérico, sem lógica de domínio. Usa tokens do tema (sem hex hardcoded).
 */
export function EmptyState({
  icon,
  tone = 'terracotta',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Stack align="center" justify="center" gap={0} py={64} px="md" ta="center">
      {icon && (
        <Box mb="lg">
          <IconChip icon={icon} tone={tone} size={64} iconSize={28} />
        </Box>
      )}
      <Text fz="lg" fw={700} c="var(--mantine-color-text)">
        {title}
      </Text>
      {description && (
        <Text c="dimmed" fz="sm" mt={6} maw={380} lh={1.5}>
          {description}
        </Text>
      )}
      {action && <Box mt="lg">{action}</Box>}
    </Stack>
  );
}
