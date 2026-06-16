import { useNavigate } from 'react-router-dom';
import { Box, Button, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { Chat, Sparkles } from '@/components/atoms/Icon';

interface OnboardingStep {
  n: string;
  t: string;
  d: string;
}

const STEPS: OnboardingStep[] = [
  { n: '01', t: 'Dados pessoais', d: 'Contato e localização' },
  { n: '02', t: 'Formação', d: 'Cursos e certificações' },
  { n: '03', t: 'Experiência', d: 'Cargos e conquistas' },
  { n: '04', t: 'Projetos & Skills', d: 'O que você domina' },
];

/**
 * Card grande de onboarding (porte do `DashboardEmpty`): lado esquerdo com CTA
 * "Iniciar entrevista" → /chat; lado direito com as 4 etapas sobre gradiente
 * terracotta.
 */
export function OnboardingCard() {
  const navigate = useNavigate();

  return (
    <Paper
      withBorder
      radius="lg"
      style={{ overflow: 'hidden', border: 0, boxShadow: 'var(--mantine-shadow-md)' }}
    >
      <Grid gutter={0}>
        <Grid.Col span={{ base: 12, md: 6 }} p={{ base: 'xl', md: 40 }}>
          <Box
            mb="lg"
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 56,
              height: 56,
              borderRadius: 16,
              color: '#fff',
              background:
                'linear-gradient(135deg, var(--mantine-color-terracotta-5), var(--mantine-color-terracotta-8))',
              boxShadow: '0 8px 24px rgba(207,85,48,.4)',
            }}
          >
            <Chat size={26} />
          </Box>
          <Title order={2} fz={24} fw={800} lh={1.15} c="var(--mantine-color-text)">
            Nenhum currículo ainda
          </Title>
          <Text c="dimmed" mt={10} fz={15} lh={1.6}>
            Sem formulários intermináveis. Um entrevistador por IA conversa com
            você, fase a fase, e um time de agentes redige, revisa e{' '}
            <Text span fw={600} c="var(--mantine-color-text)">
              avalia seu currículo de 0 a 10
            </Text>
            .
          </Text>
          <Group mt="xl" gap="md" align="center">
            <Button
              color="terracotta"
              size="lg"
              leftSection={<Sparkles size={18} />}
              onClick={() => navigate('/chat')}
            >
              Iniciar entrevista
            </Button>
            <Text fz={13} c="dimmed">
              leva ~10 min
            </Text>
          </Group>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Box
            pos="relative"
            h="100%"
            p={{ base: 'xl', md: 40 }}
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-terracotta-6), var(--mantine-color-terracotta-9))',
            }}
          >
            <Box
              pos="absolute"
              inset={0}
              style={{
                opacity: 0.3,
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,.4) 1px, transparent 0)',
                backgroundSize: '18px 18px',
                pointerEvents: 'none',
              }}
            />
            <Stack gap="sm" pos="relative">
              {STEPS.map((s) => (
                <Group
                  key={s.n}
                  gap="md"
                  wrap="nowrap"
                  px="md"
                  py="sm"
                  style={{
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Text
                    ff="monospace"
                    fz={13}
                    fw={600}
                    style={{ color: 'rgba(255,255,255,0.85)', width: 28, flexShrink: 0 }}
                  >
                    {s.n}
                  </Text>
                  <Box>
                    <Text fz={14} fw={700} c="#fff" lh={1.2}>
                      {s.t}
                    </Text>
                    <Text fz={12} style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {s.d}
                    </Text>
                  </Box>
                </Group>
              ))}
            </Stack>
          </Box>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
