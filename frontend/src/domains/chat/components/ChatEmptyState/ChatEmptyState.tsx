import { Badge, Button, Center, Group, Stack, Text, Title } from '@mantine/core';
import { InterviewerAvatar } from '../InterviewerAvatar/InterviewerAvatar';
import { PHASE_LABELS, PHASE_STEPS } from '../../types';

interface ChatEmptyStateProps {
  onStart: () => void;
  loading?: boolean;
}

export function ChatEmptyState({ onStart, loading = false }: ChatEmptyStateProps) {
  return (
    <Center h="100%" px="md">
      <Stack align="center" gap="md" maw={460} ta="center">
        <InterviewerAvatar size={64} />
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
