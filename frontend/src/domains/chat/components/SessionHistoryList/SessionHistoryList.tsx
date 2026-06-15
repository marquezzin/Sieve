import { useMemo } from 'react';
import { Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import type { Session } from '../../types';
import { ChatEmptyState } from '../ChatEmptyState/ChatEmptyState';
import { SessionHistoryCard } from '../SessionHistoryCard/SessionHistoryCard';
import { SparklesIcon } from '../sparkles';
import classes from './SessionHistoryList.module.css';

interface SessionHistoryListProps {
  sessions: Session[];
  onOpen: (id: string) => void;
  onStart: () => void;
  starting?: boolean;
}

export function SessionHistoryList({
  sessions,
  onOpen,
  onStart,
  starting = false,
}: SessionHistoryListProps) {
  // Mais recente primeiro; sessão ativa fixada no topo (retomável).
  const ordered = useMemo(() => {
    const byRecent = [...sessions].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
    const active = byRecent.filter((s) => s.status === 'active');
    const rest = byRecent.filter((s) => s.status !== 'active');
    return [...active, ...rest];
  }, [sessions]);

  if (sessions.length === 0) {
    return <ChatEmptyState onStart={onStart} loading={starting} />;
  }

  return (
    <Box className={classes.scroll}>
      <Stack gap="lg" maw={720} mx="auto" px="md" py="xl">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
          <Stack gap={2}>
            <Text
              fz="xs"
              fw={700}
              tt="uppercase"
              c="terracotta.6"
              style={{ letterSpacing: '0.08em' }}
            >
              Entrevistador Sieve
            </Text>
            <Title order={2} fz={26}>
              Suas entrevistas
            </Title>
          </Stack>
          <Button
            color="terracotta"
            loading={starting}
            leftSection={<SparklesIcon size={16} />}
            onClick={onStart}
          >
            Iniciar nova entrevista
          </Button>
        </Group>

        <Stack gap="sm">
          {ordered.map((session) => (
            <SessionHistoryCard
              key={session.id}
              session={session}
              onOpen={onOpen}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
