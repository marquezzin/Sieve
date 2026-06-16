import { Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { formatRelative } from '@/lib/formatters';
import {
  PHASE_LABELS,
  summarizeCollectedData,
  summaryLine,
  type Session,
} from '../../types';
import { InterviewerAvatar } from '../InterviewerAvatar/InterviewerAvatar';
import { ArrowRightIcon, ChevronRightIcon } from '../icons';
import classes from './SessionHistoryCard.module.css';

interface SessionHistoryCardProps {
  session: Session;
  onOpen: (id: string) => void;
}

export function SessionHistoryCard({ session, onOpen }: SessionHistoryCardProps) {
  const isActive = session.status === 'active';
  const summary = summarizeCollectedData(session.collected_data);
  const phaseLabel = isActive
    ? PHASE_LABELS[session.current_phase]
    : 'Concluída';

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      className={classes.card}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(session.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(session.id);
        }
      }}
    >
      <Group gap="md" wrap="nowrap" align="flex-start">
        <InterviewerAvatar size={42} />
        <Stack gap={6} flex={1} miw={0}>
          <Group gap="xs" wrap="wrap">
            {isActive ? (
              <Badge color="terracotta" variant="light">
                Em andamento
              </Badge>
            ) : (
              <Badge color="green" variant="light">
                Concluída
              </Badge>
            )}
            <Text fz="xs" c="dimmed">
              {phaseLabel}
            </Text>
            <Text fz="xs" c="dimmed">
              · {formatRelative(session.updated_at)}
            </Text>
          </Group>
          <Text fz="sm" c="light-dark(#37312a, #e0d6c8)" lineClamp={1}>
            {summaryLine(summary)}
          </Text>
        </Stack>

        {isActive ? (
          <Button
            color="terracotta"
            size="xs"
            rightSection={<ArrowRightIcon size={15} />}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(session.id);
            }}
          >
            Continuar
          </Button>
        ) : (
          <Group gap={4} c="gray.5" className={classes.openHint} wrap="nowrap">
            <Text fz="xs" fw={600} c="dimmed">
              Ver
            </Text>
            <ChevronRightIcon size={16} />
          </Group>
        )}
      </Group>
    </Paper>
  );
}
