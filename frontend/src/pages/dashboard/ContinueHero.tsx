import { useNavigate } from 'react-router-dom';
import { Badge, Box, Group, Paper, Progress, Text, Title, UnstyledButton } from '@mantine/core';
import { ArrowRight, Clock } from '@/components/atoms/Icon';
import {
  PHASE_LABELS,
  PHASE_STEPS,
  phaseIndex,
  type Phase,
} from '@/domains/chat';

interface ContinueHeroProps {
  phase: Phase;
}

/**
 * Hero "Continue de onde parou" — só renderiza quando há uma sessão `active`.
 * Porte do bloco de gradiente do `DashboardData`, em terracotta (IDV do produto).
 */
export function ContinueHero({ phase }: ContinueHeroProps) {
  const navigate = useNavigate();
  const done = phaseIndex(phase);
  const total = PHASE_STEPS.length;
  const pct = Math.round((done / total) * 100);

  return (
    <Paper
      radius="lg"
      mb="lg"
      style={{
        overflow: 'hidden',
        border: 0,
        color: '#fff',
        background:
          'linear-gradient(135deg, var(--mantine-color-terracotta-6), var(--mantine-color-terracotta-8) 55%, var(--mantine-color-terracotta-9))',
      }}
    >
      <Box pos="relative" p={{ base: 'xl', md: 32 }}>
        <Box
          pos="absolute"
          top={0}
          right={0}
          w={320}
          h={320}
          style={{
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            transform: 'translate(25%, -33%)',
            pointerEvents: 'none',
          }}
        />
        <Group
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="lg"
          pos="relative"
        >
          <Box maw={560}>
            <Badge
              radius="sm"
              mb="sm"
              styles={{
                root: {
                  background: 'rgba(255,255,255,0.16)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.22)',
                },
              }}
              leftSection={<Clock size={12} />}
            >
              Entrevista em andamento
            </Badge>
            <Title order={2} fz={22} fw={800} style={{ letterSpacing: '-0.02em' }}>
              Continue de onde parou
            </Title>
            <Text mt="xs" fz={15} lh={1.6} style={{ color: 'rgba(255,255,255,0.85)' }}>
              Você está na fase{' '}
              <Text span fw={700} c="#fff">
                {PHASE_LABELS[phase]}
              </Text>
              . Retome a conversa para o entrevistador finalizar e gerar seu
              currículo.
            </Text>
            <Group mt="md" gap="sm" wrap="nowrap" maw={340}>
              <Progress
                value={pct}
                size="sm"
                radius="xl"
                color="#fff"
                style={{ flex: 1, background: 'rgba(255,255,255,0.22)' }}
              />
              <Text
                fz={12.5}
                fw={700}
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                }}
              >
                {done} / {total} fases
              </Text>
            </Group>
          </Box>

          <UnstyledButton
            onClick={() => navigate('/chat')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 48,
              paddingInline: 24,
              borderRadius: 12,
              background: '#fff',
              color: 'var(--mantine-color-terracotta-7)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Continuar entrevista <ArrowRight size={18} />
          </UnstyledButton>
        </Group>
      </Box>
    </Paper>
  );
}
