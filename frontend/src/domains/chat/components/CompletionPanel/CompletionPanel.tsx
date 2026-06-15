import { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { formatDate, formatRelative } from '@/lib/formatters';
import type { Session } from '../../types';
import { InterviewSummary } from '../InterviewSummary/InterviewSummary';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import { CheckIcon, ChevronRightIcon } from '../icons';
import classes from './CompletionPanel.module.css';

interface CompletionPanelProps {
  session: Session;
  onNewInterview: () => void;
  onBack: () => void;
  startingNew?: boolean;
}

export function CompletionPanel({
  session,
  onNewInterview,
  onBack,
  startingNew = false,
}: CompletionPanelProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <Box className={classes.scroll}>
      <Stack gap="lg" maw={860} mx="auto" px="md" py="xl">
        {/* Banner de conclusão */}
        <Paper withBorder radius="lg" p="xl" className={classes.banner}>
          <Group gap="md" wrap="nowrap" align="flex-start">
            <ThemeIcon color="green" radius="xl" size={52} className={classes.checkTile}>
              <CheckIcon size={26} />
            </ThemeIcon>
            <Stack gap={4} miw={0}>
              <Title order={2} fz={26}>
                Entrevista concluída
              </Title>
              <Text c="dimmed" fz="sm">
                Finalizada em {formatDate(session.updated_at)} ·{' '}
                {formatRelative(session.updated_at)}
              </Text>
            </Stack>
          </Group>
        </Paper>

        {/* Recap do que foi coletado */}
        <Stack gap="sm">
          <Text
            fz="xs"
            fw={700}
            tt="uppercase"
            c="dimmed"
            style={{ letterSpacing: '0.08em' }}
          >
            O que o entrevistador coletou
          </Text>
          <InterviewSummary collectedData={session.collected_data} hideEmpty />
        </Stack>

        {/* Nota Fase 2 — inerte, sem botão falso */}
        <Paper withBorder radius="md" p="md" className={classes.phaseNote}>
          <Text fz="sm" c="dimmed">
            <Text span fw={700} c="terracotta.7">
              Em breve · Fase 2:
            </Text>{' '}
            um time de agentes (redator → revisor → juiz) vai redigir e avaliar
            seu currículo a partir destes dados.
          </Text>
        </Paper>

        {/* CTAs */}
        <Group gap="sm">
          <Button color="terracotta" loading={startingNew} onClick={onNewInterview}>
            Nova entrevista
          </Button>
          <Button variant="default" onClick={onBack}>
            Voltar
          </Button>
        </Group>

        <Divider />

        {/* Transcrição read-only via toggle */}
        <Button
          variant="subtle"
          color="gray"
          justify="flex-start"
          leftSection={
            <Box className={showTranscript ? classes.chevronOpen : undefined}>
              <ChevronRightIcon size={16} />
            </Box>
          }
          onClick={() => setShowTranscript((v) => !v)}
        >
          {showTranscript ? 'Ocultar conversa' : 'Ver conversa'}
        </Button>
        <Collapse expanded={showTranscript}>
          <Stack gap="lg" pt="xs">
            {session.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </Stack>
        </Collapse>
      </Stack>
    </Box>
  );
}
