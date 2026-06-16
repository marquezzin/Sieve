import { useNavigate } from 'react-router-dom';
import { Badge, Box, Group, Loader, Paper, Text } from '@mantine/core';
import { ChevronRight, File } from '@/components/atoms/Icon';
import { IconChip } from '@/components/atoms/IconChip';
import { formatRelative } from '@/lib/formatters';
import {
  isGenerating,
  parseScore,
  scoreTone,
  StatusBadge,
  TONE_COLOR,
  type Resume,
} from '@/domains/resume';

interface ResumeRowProps {
  resume: Resume;
}

/** Linha de currículo recente — porte do `ResumeRow` do protótipo. Clicável. */
export function ResumeRow({ resume }: ResumeRowProps) {
  const navigate = useNavigate();
  const ready = resume.status === 'ready';
  const generating = isGenerating(resume.status);
  const score = parseScore(resume.latest_score);
  const scoreColor = score !== null ? TONE_COLOR[scoreTone(score)] : 'gray';

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      onClick={() => navigate(`/resumes/${resume.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <Group gap="md" wrap="nowrap">
        <IconChip icon={File} tone="terracotta" size={44} iconSize={19} />

        <Box style={{ minWidth: 0, flex: 1 }}>
          <Group gap="xs" wrap="nowrap">
            <Text fw={700} c="var(--mantine-color-text)" truncate>
              {resume.title}
            </Text>
            {resume.versions_count > 0 && (
              <Badge color="gray" variant="light" radius="sm" style={{ flexShrink: 0 }}>
                v{resume.versions_count}
              </Badge>
            )}
          </Group>
          <Text fz={13} c="dimmed" truncate mt={2}>
            {resume.target_role}
          </Text>
        </Box>

        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          {ready && score !== null && (
            <Group gap={4} align="baseline" wrap="nowrap">
              <Text ff="monospace" fz="md" fw={600} c={`${scoreColor}.7`}>
                {score.toFixed(1)}
              </Text>
              <Text fz="xs" fw={600} c="dimmed">
                /10
              </Text>
            </Group>
          )}
          {generating && (
            <Group gap={6} wrap="nowrap">
              <Loader size={14} color="yellow" />
              <Text fz={12} fw={600} c="yellow.7">
                redigindo…
              </Text>
            </Group>
          )}
          <StatusBadge status={resume.status} />
          <Text
            fz={11.5}
            c="dimmed"
            ta="right"
            visibleFrom="md"
            style={{ width: 64 }}
          >
            {formatRelative(resume.updated_at)}
          </Text>
          <Box c="gray.4">
            <ChevronRight size={16} />
          </Box>
        </Group>
      </Group>
    </Paper>
  );
}
