import type { ComponentType } from 'react';
import { Badge, Box, Group, Paper, Stack, Text } from '@mantine/core';
import type { IconProps } from '@/components/atoms/Icon';

interface ComingSoonPanelProps {
  icon: ComponentType<IconProps>;
  title: string;
  description: string;
  /** Rótulo do badge — ex.: "Em breve · Vagas". */
  badge: string;
}

/**
 * Placeholder inerte "Em breve" — segue o idioma de `CompletionPanel` /
 * `PhotoStudioPlaceholder`: `Paper withBorder` + `Badge terracotta light` +
 * conteúdo `dimmed`, sem botão funcional.
 */
export function ComingSoonPanel({
  icon: Icon,
  title,
  description,
  badge,
}: ComingSoonPanelProps) {
  return (
    <Paper withBorder radius="lg" p="lg" aria-disabled style={{ opacity: 0.85 }}>
      <Group gap="md" wrap="nowrap" align="flex-start">
        <Box
          c="gray.6"
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 40,
            height: 40,
            borderRadius: 12,
            flexShrink: 0,
            background:
              'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-5))',
            border:
              '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-4))',
          }}
        >
          <Icon size={18} />
        </Box>
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" align="center" wrap="nowrap">
            <Text fw={700} c="var(--mantine-color-text)">
              {title}
            </Text>
            <Badge color="terracotta" variant="light" radius="sm" style={{ flexShrink: 0 }}>
              {badge}
            </Badge>
          </Group>
          <Text fz={13} c="dimmed" lh={1.5}>
            {description}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}
