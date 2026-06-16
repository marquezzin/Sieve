import { Badge, Box, Group, Paper, Stack, Text } from '@mantine/core';
import { formatRelative } from '@/lib/formatters';
import {
  AGENT_LABELS,
  parseScore,
  scoreTone,
  TONE_COLOR,
  type ResumeVersionSummary,
} from '../../types';

interface VersionListProps {
  versions: ResumeVersionSummary[];
  /** Número da versão mais recente (marcada como "atual"). */
  latestVersionNumber: number | null;
}

/** Lista de versões (v1/v2 + score + marcação "atual"), porte do protótipo. */
export function VersionList({ versions, latestVersionNumber }: VersionListProps) {
  const ordered = [...versions].sort(
    (a, b) => b.version_number - a.version_number,
  );

  return (
    <Stack gap="xs">
      {ordered.map((v) => {
        const isCurrent = v.version_number === latestVersionNumber;
        const score = parseScore(v.overall);
        const scoreColor =
          score !== null ? TONE_COLOR[scoreTone(score)] : 'gray';
        return (
          <Paper
            key={v.id}
            withBorder
            radius="md"
            px="sm"
            py={10}
            style={
              isCurrent
                ? {
                    borderColor: 'var(--mantine-color-terracotta-3)',
                    backgroundColor:
                      'light-dark(var(--mantine-color-terracotta-0), rgba(207,85,48,.08))',
                  }
                : undefined
            }
          >
            <Group gap="sm" wrap="nowrap">
              <Text
                ff="monospace"
                fw={700}
                fz={13}
                w={28}
                c={isCurrent ? 'terracotta.7' : 'dimmed'}
              >
                v{v.version_number}
              </Text>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text fz={12.5} fw={600} c="var(--mantine-color-text)" truncate>
                  {AGENT_LABELS[v.generated_by_agent]}
                </Text>
                <Text fz={11} c="dimmed">
                  {formatRelative(v.created_at)}
                </Text>
              </Box>
              {score !== null && (
                <Text ff="monospace" fz={13} fw={600} c={`${scoreColor}.7`}>
                  {score.toFixed(1)}
                </Text>
              )}
              {isCurrent && (
                <Badge color="terracotta" radius="sm">
                  atual
                </Badge>
              )}
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
}
