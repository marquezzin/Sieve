import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { InterviewerAvatar } from '../../components/InterviewerAvatar/InterviewerAvatar';
import { PhaseStepper } from '../../components/PhaseStepper/PhaseStepper';
import { MessageBubble } from '../../components/MessageBubble/MessageBubble';
import { TypingIndicator } from '../../components/TypingIndicator/TypingIndicator';
import { ChatComposer } from '../../components/ChatComposer/ChatComposer';
import { ChatEmptyState } from '../../components/ChatEmptyState/ChatEmptyState';
import { useSessions } from '../../hooks/useSessions';
import { useSession } from '../../hooks/useSession';
import { useCreateSession } from '../../hooks/useCreateSession';
import { useSendMessage } from '../../hooks/useSendMessage';
import { useFinalizeSession } from '../../hooks/useFinalizeSession';
import { PHASE_LABELS, canFinalize } from '../../types';

function ActiveSession({ sessionId }: { sessionId: string }) {
  const sessionQuery = useSession(sessionId);
  const sendMutation = useSendMessage(sessionId);
  const finalizeMutation = useFinalizeSession(sessionId);
  const viewportRef = useRef<HTMLDivElement>(null);

  const session = sessionQuery.data;
  const messages = session?.messages ?? [];
  const isTyping = sendMutation.isPending;

  useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length, isTyping]);

  if (sessionQuery.isLoading) {
    return (
      <Center h="100%">
        <Loader color="terracotta" />
      </Center>
    );
  }

  if (sessionQuery.isError || !session) {
    return (
      <Center h="100%" px="md">
        <Alert color="red" title="Erro ao carregar a sessão">
          {sessionQuery.error?.message ?? 'Sessão indisponível.'}
        </Alert>
      </Center>
    );
  }

  const isCompleted = session.status === 'completed';
  const finalizeEnabled = !isCompleted && canFinalize(session.current_phase);

  return (
    <Stack gap={0} h="100%">
      {/* Header da sessão */}
      <Group justify="space-between" wrap="nowrap" px="md" py="sm" gap="sm">
        <Group gap="sm" wrap="nowrap" miw={0}>
          <InterviewerAvatar size={38} />
          <Box miw={0}>
            <Group gap="xs">
              <Text fw={700}>Entrevistador Sieve</Text>
              {isCompleted ? (
                <Badge color="gray" variant="light">
                  concluída
                </Badge>
              ) : (
                <Badge color="green" variant="dot">
                  online
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">
              Fase atual:{' '}
              <Text span fw={600} c="terracotta.7">
                {PHASE_LABELS[session.current_phase]}
              </Text>
            </Text>
          </Box>
        </Group>
        <Button
          color="terracotta"
          variant={finalizeEnabled ? 'filled' : 'default'}
          disabled={!finalizeEnabled}
          loading={finalizeMutation.isPending}
          onClick={() => finalizeMutation.mutate()}
          title={
            finalizeEnabled
              ? undefined
              : 'Disponível quando houver dados suficientes'
          }
        >
          Finalizar entrevista
        </Button>
      </Group>

      <Box px="md" py="xs">
        <PhaseStepper current={session.current_phase} />
      </Box>
      <Divider />

      {/* Mensagens */}
      <ScrollArea flex={1} viewportRef={viewportRef} type="auto">
        <Stack gap="lg" px="md" py="lg" maw={860} mx="auto">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
        </Stack>
      </ScrollArea>

      <Divider />

      {/* Composer */}
      <Box px="md" py="sm" maw={900} mx="auto" w="100%">
        <ChatComposer
          disabled={isTyping || isCompleted}
          onSend={(text) => sendMutation.mutate(text)}
        />
      </Box>
    </Stack>
  );
}

export function ChatPage() {
  const sessionsQuery = useSessions();
  const createMutation = useCreateSession();
  // id selecionado manualmente (nova sessão recém-criada). Quando null,
  // caímos na sessão `active` existente — sem setState dentro de effect.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const existingActive = useMemo(
    () => sessionsQuery.data?.find((s) => s.status === 'active') ?? null,
    [sessionsQuery.data],
  );

  const activeId = selectedId ?? existingActive?.id ?? null;

  const handleStart = () => {
    createMutation.mutate(undefined, {
      onSuccess: (session) => setSelectedId(session.id),
    });
  };

  const content = () => {
    if (sessionsQuery.isLoading) {
      return (
        <Center h="100%">
          <Loader color="terracotta" />
        </Center>
      );
    }

    if (sessionsQuery.isError) {
      return (
        <Center h="100%" px="md">
          <Alert color="red" title="Erro ao carregar sessões">
            {sessionsQuery.error.message}
          </Alert>
        </Center>
      );
    }

    if (activeId) {
      return <ActiveSession sessionId={activeId} />;
    }

    return (
      <ChatEmptyState onStart={handleStart} loading={createMutation.isPending} />
    );
  };

  return (
    <Paper withBorder radius="md" h="calc(100dvh - 88px)" style={{ overflow: 'hidden' }}>
      {content()}
    </Paper>
  );
}
