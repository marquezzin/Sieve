import { Badge, Button, Center, Group, Stack, Text, Title } from '@mantine/core';
import { PHASE_LABELS, PHASE_STEPS } from '../../types';
import classes from './ChatEmptyState.module.css';

interface ChatEmptyStateProps {
  onStart: () => void;
  loading?: boolean;
}

function SparklesIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />
      <path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
      <path d="M5 15l.6 1.5 1.5.6-1.5.6L5 19.8l-.6-1.5L2.9 17.7l1.5-.6z" />
    </svg>
  );
}

export function ChatEmptyState({ onStart, loading = false }: ChatEmptyStateProps) {
  return (
    <Center h="100%" px="md">
      <Stack align="center" gap="md" maw={460} ta="center">
        <span className={classes.iconTile}>
          <SparklesIcon size={30} />
        </span>
        <Title order={2}>Pronta para começar?</Title>
        <Text c="dimmed">
          O entrevistador do Sieve vai te guiar por 7 fases rápidas. Responda no
          seu ritmo — você pode pausar e voltar quando quiser.
        </Text>
        <Button size="md" color="terracotta" loading={loading} onClick={onStart}>
          Iniciar nova sessão
        </Button>
        <Group justify="center" gap="xs" mt="sm">
          {PHASE_STEPS.map((phase) => (
            <Badge key={phase} variant="light" color="gray">
              {PHASE_LABELS[phase]}
            </Badge>
          ))}
        </Group>
      </Stack>
    </Center>
  );
}
