import type { ReactNode } from 'react';
import { Group, Text } from '@mantine/core';

interface SectionLabelProps {
  children: ReactNode;
  right?: ReactNode;
}

/** Cabeçalho de seção do dashboard (porte do `SectionLabel` do protótipo). */
export function SectionLabel({ children, right }: SectionLabelProps) {
  return (
    <Group justify="space-between" align="center" mb="sm" wrap="nowrap">
      <Text
        fz={13}
        fw={700}
        c="light-dark(var(--mantine-color-gray-8), var(--mantine-color-dark-0))"
      >
        {children}
      </Text>
      {right}
    </Group>
  );
}
