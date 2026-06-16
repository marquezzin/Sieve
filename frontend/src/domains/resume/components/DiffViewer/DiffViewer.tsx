import { Badge, Box, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import type { Change, ChangeType, VersionDiff } from '../../types';

interface DiffViewerProps {
  diff: VersionDiff;
}

interface ToneVisual {
  color: string;
  label: string;
}

const TONE: Record<ChangeType, ToneVisual> = {
  add: { color: 'green', label: 'Adicionado' },
  rem: { color: 'red', label: 'Removido' },
  mod: { color: 'yellow', label: 'Modificado' },
};

type Column = 'from' | 'to';

/** Conteúdo da mudança naquela coluna (before/after). */
function contentFor(change: Change, col: Column): string | null {
  return col === 'from' ? change.before : change.after;
}

/** A mudança aparece nesta coluna? add não aparece em `from`, rem não em `to`. */
function showsIn(change: Change, col: Column): boolean {
  if (col === 'from') return change.type !== 'add';
  return change.type !== 'rem';
}

/** Esta coluna deve destacar a mudança (lado que mudou)? */
function highlightIn(change: Change, col: Column): boolean {
  if (col === 'to') return change.type === 'add' || change.type === 'mod';
  return change.type === 'rem';
}

function DiffColumn({
  col,
  changes,
}: {
  col: Column;
  changes: Change[];
}) {
  const versionNumber = col === 'from' ? 'from' : 'to';
  return (
    <Box>
      <Group gap="xs" mb="sm">
        <Badge color={col === 'from' ? 'gray' : 'terracotta'} radius="sm">
          {col === 'from' ? 'Anterior' : 'Atual'}
        </Badge>
        <Text fz={13} fw={700} c="var(--mantine-color-text)">
          {col === 'from' ? 'Versão anterior' : 'Versão atual'}
        </Text>
      </Group>
      <Paper withBorder radius="lg" p="md">
        <Stack gap="sm">
          {changes.map((change, i) => {
            const tone = TONE[change.type];
            if (!showsIn(change, col)) {
              return (
                <Box
                  key={`${versionNumber}-${i}`}
                  px="sm"
                  py={10}
                  style={{
                    border: '1px dashed var(--mantine-color-gray-3)',
                    borderRadius: 'var(--mantine-radius-md)',
                  }}
                >
                  <Text fz={12} c="dimmed" fs="italic">
                    — {change.type === 'add' ? '(adicionado na versão atual)' : '(removido)'} —
                  </Text>
                </Box>
              );
            }
            const highlight = highlightIn(change, col);
            const content = contentFor(change, col);
            const struck = change.type === 'rem' && col === 'from';
            return (
              <Paper
                key={`${versionNumber}-${i}`}
                radius="md"
                px="md"
                py={12}
                withBorder={!highlight}
                bg={
                  highlight
                    ? `light-dark(var(--mantine-color-${tone.color}-0), rgba(0,0,0,.18))`
                    : undefined
                }
                style={
                  highlight
                    ? { borderColor: `var(--mantine-color-${tone.color}-3)`, borderWidth: 1, borderStyle: 'solid' }
                    : undefined
                }
              >
                <Group justify="space-between" mb={6} wrap="nowrap">
                  <Text
                    fz={10.5}
                    fw={700}
                    tt="uppercase"
                    c="dimmed"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    {change.section}
                  </Text>
                  {highlight && (
                    <Badge color={tone.color} radius="sm" size="sm">
                      {tone.label}
                    </Badge>
                  )}
                </Group>
                <Text
                  fz={12.5}
                  lh={1.6}
                  c={struck ? `${tone.color}.7` : 'var(--mantine-color-text)'}
                  td={struck ? 'line-through' : undefined}
                >
                  {content}
                </Text>
              </Paper>
            );
          })}
        </Stack>
      </Paper>
    </Box>
  );
}

/** Comparação side-by-side de duas versões (porte do `ResumeDiff`). */
export function DiffViewer({ diff }: DiffViewerProps) {
  return (
    <Box>
      <Paper withBorder radius="md" p="sm" mb="md">
        <Group gap="md" justify="space-between" wrap="wrap">
          <Text fz={13} fw={700} c="var(--mantine-color-text)">
            Comparando v{diff.from} → v{diff.to}
          </Text>
          <Group gap="md" fz={12} fw={600}>
            <Group gap={6} wrap="nowrap">
              <Box w={10} h={10} bg="green.4" style={{ borderRadius: 3 }} />
              <Text fz={12} fw={600} c="green.7">
                Adicionado
              </Text>
            </Group>
            <Group gap={6} wrap="nowrap">
              <Box w={10} h={10} bg="yellow.4" style={{ borderRadius: 3 }} />
              <Text fz={12} fw={600} c="yellow.7">
                Modificado
              </Text>
            </Group>
            <Group gap={6} wrap="nowrap">
              <Box w={10} h={10} bg="red.4" style={{ borderRadius: 3 }} />
              <Text fz={12} fw={600} c="red.6">
                Removido
              </Text>
            </Group>
          </Group>
        </Group>
      </Paper>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <DiffColumn col="from" changes={diff.changes} />
        <DiffColumn col="to" changes={diff.changes} />
      </SimpleGrid>
    </Box>
  );
}
