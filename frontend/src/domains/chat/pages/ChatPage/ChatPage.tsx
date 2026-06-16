import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { InterviewerAvatar } from '../../components/InterviewerAvatar/InterviewerAvatar';
import { PhaseStepper } from '../../components/PhaseStepper/PhaseStepper';
import { MessageBubble } from '../../components/MessageBubble/MessageBubble';
import { TypingIndicator } from '../../components/TypingIndicator/TypingIndicator';
import { ChatComposer } from '../../components/ChatComposer/ChatComposer';
import { SessionHistoryList } from '../../components/SessionHistoryList/SessionHistoryList';
import { CompletionPanel } from '../../components/CompletionPanel/CompletionPanel';
import { ArrowLeftIcon } from '../../components/icons';
import { useSessions } from '../../hooks/useSessions';
import { useSession } from '../../hooks/useSession';
import { useCreateSession } from '../../hooks/useCreateSession';
import { useSendMessage } from '../../hooks/useSendMessage';
import { useFinalizeSession } from '../../hooks/useFinalizeSession';
import { PHASE_LABELS, canFinalize } from '../../types';
import classes from './ChatPage.module.css';

interface SessionViewProps {
  sessionId: string;
  onBack: () => void;
  onNewInterview: () => void;
  startingNew: boolean;
}

function SessionView({
  sessionId,
  onBack,
  onNewInterview,
  startingNew,
}: SessionViewProps) {
  const navigate = useNavigate();
  const sessionQuery = useSession(sessionId);
  const sendMutation = useSendMessage(sessionId);
  const finalizeMutation = useFinalizeSession(sessionId);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Pós-finalize: se o backend devolveu o currículo gerado, navega direto
  // pra ele (estado de geração com polling). Sessões concluídas vindas do
  // histórico NÃO têm `resume_id`, então o CompletionPanel segue intacto.
  const handleFinalize = () => {
    finalizeMutation.mutate(undefined, {
      onSuccess: (session) => {
        if (session.resume_id) navigate(`/resumes/${session.resume_id}`);
      },
    });
  };

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

  // Sessão concluída → experiência de recap (read-only).
  if (session.status === 'completed') {
    return (
      <CompletionPanel
        session={session}
        onBack={onBack}
        onNewInterview={onNewInterview}
        startingNew={startingNew}
      />
    );
  }

  const finalizeEnabled = canFinalize(session.current_phase);

  return (
    <Stack gap={0} h="100%">
      {/* Header da sessão */}
      <Group
        justify="space-between"
        wrap="nowrap"
        px="md"
        py="sm"
        gap="sm"
        className={classes.header}
      >
        <Group gap="sm" wrap="nowrap" miw={0}>
          <Button
            variant="subtle"
            color="gray"
            size="compact-sm"
            px="xs"
            onClick={onBack}
            aria-label="Voltar para as entrevistas"
          >
            <ArrowLeftIcon size={18} />
          </Button>
          <InterviewerAvatar size={38} />
          <Box miw={0}>
            <Group gap="xs">
              <Text fw={700}>Entrevistador Sieve</Text>
              <Badge color="green" variant="dot">
                online
              </Badge>
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
          onClick={handleFinalize}
          title={
            finalizeEnabled
              ? undefined
              : 'Disponível quando houver dados suficientes'
          }
        >
          Finalizar entrevista
        </Button>
      </Group>

      <Box px="md" py="xs" className={classes.stepperBar}>
        <PhaseStepper current={session.current_phase} />
      </Box>

      {/* Mensagens */}
      <ScrollArea flex={1} viewportRef={viewportRef} type="auto">
        <Stack gap="lg" px="md" py="lg" maw={860} mx="auto">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
        </Stack>
      </ScrollArea>

      {/* Composer */}
      <Box px="md" pt="xs" pb="md" className={classes.composerBar}>
        <Box maw={900} mx="auto" w="100%">
          <ChatComposer
            disabled={isTyping}
            onSend={(text) => sendMutation.mutate(text)}
          />
        </Box>
      </Box>
    </Stack>
  );
}

export function ChatPage() {
  const sessionsQuery = useSessions();
  const createMutation = useCreateSession();
  // id da sessão aberta. null → lista de entrevistas (estado inicial e
  // o estado após reload pós-finalização — é o que conserta o "sumiço").
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

    if (selectedId) {
      return (
        <SessionView
          sessionId={selectedId}
          onBack={() => setSelectedId(null)}
          onNewInterview={handleStart}
          startingNew={createMutation.isPending}
        />
      );
    }

    return (
      <SessionHistoryList
        sessions={sessionsQuery.data ?? []}
        onOpen={setSelectedId}
        onStart={handleStart}
        starting={createMutation.isPending}
      />
    );
  };

  return (
    // Full-bleed sobre o canvas creme (NÃO é um cartão branco): a classe
    // `.canvas` pinta o creme + glow + textura do protótipo. Box (não Paper)
    // pra não herdar o fundo branco/dark-6 do override de superfície do tema.
    <Box
      h="calc(100dvh - 164px)"
      className={classes.canvas}
      style={{
        overflow: 'hidden',
        borderRadius: 'var(--mantine-radius-md)',
        border: '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-4))',
      }}
    >
      {content()}
    </Box>
  );
}
