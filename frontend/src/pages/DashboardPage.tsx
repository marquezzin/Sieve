import { useMemo, type ComponentType, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Center,
  Grid,
  Group,
  Loader,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import {
  Briefcase,
  ChevronRight,
  Chat,
  File,
  Kanban,
  Sparkles,
} from '@/components/atoms/Icon';
import type { IconProps } from '@/components/atoms/Icon';
import { IconChip, type IconChipTone } from '@/components/atoms/IconChip';
import { StatCard } from '@/components/molecules/StatCard';
import { formatRelative } from '@/lib/formatters';
import { useMe } from '@/domains/profile';
import {
  PHASE_LABELS,
  interviewHeadline,
  summarizeCollectedData,
  summaryLine,
  useSessions,
  type Session,
} from '@/domains/chat';
import {
  parseScore,
  scoreTone,
  TONE_COLOR,
  useResumes,
  type Resume,
} from '@/domains/resume';
import { ComingSoonPanel } from './dashboard/ComingSoonPanel';
import { ContinueHero } from './dashboard/ContinueHero';
import { OnboardingCard } from './dashboard/OnboardingCard';
import { ResumeRow } from './dashboard/ResumeRow';
import { SectionLabel } from './dashboard/SectionLabel';

const todayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** Capitaliza a primeira letra (Intl devolve "segunda, 16 de junho"). */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Primeiro nome do usuário, com fallback amigável. */
function firstNameOf(fullName: string | undefined): string {
  const trimmed = (fullName ?? '').trim();
  if (!trimmed) return 'você';
  return trimmed.split(/\s+/)[0];
}

/** Item derivado, honestamente, dos dados reais para "Atividade recente". */
interface ActivityItem {
  key: string;
  iso: string;
  icon: ComponentType<IconProps>;
  tone: IconChipTone;
  node: ReactNode;
}

/** Maior score entre os currículos prontos. `null` se nenhum. */
function bestScore(resumes: Resume[]): number | null {
  let best: number | null = null;
  for (const r of resumes) {
    const s = parseScore(r.latest_score);
    if (s !== null && (best === null || s > best)) best = s;
  }
  return best;
}

function buildActivity(resumes: Resume[], sessions: Session[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const r of resumes) {
    if (r.status === 'ready') {
      const score = parseScore(r.latest_score);
      items.push({
        key: `resume-${r.id}`,
        iso: r.updated_at,
        icon: Sparkles,
        tone: 'blue',
        node: (
          <>
            Currículo{' '}
            <Text span fw={700} c="var(--mantine-color-text)">
              {r.title}
            </Text>{' '}
            avaliado
            {score !== null ? (
              <>
                {' '}
                com nota{' '}
                <Text span fw={700} c="var(--mantine-color-text)">
                  {score.toFixed(1)}
                </Text>
              </>
            ) : null}
          </>
        ),
      });
    }
  }

  for (const s of sessions) {
    let node: ReactNode;
    if (s.status === 'completed') {
      const headline = interviewHeadline(s.collected_data);
      node = headline.name ? (
        <>
          Entrevista de{' '}
          <Text span fw={700} c="var(--mantine-color-text)">
            {headline.name}
          </Text>{' '}
          concluída
          {headline.subtitle ? (
            <Text span c="dimmed">
              {' '}
              · {headline.subtitle}
            </Text>
          ) : null}
        </>
      ) : (
        <>
          Entrevista concluída —{' '}
          <Text span fw={700} c="var(--mantine-color-text)">
            {summaryLine(summarizeCollectedData(s.collected_data))}
          </Text>
        </>
      );
    } else {
      node = (
        <>
          Entrevista em{' '}
          <Text span fw={700} c="var(--mantine-color-text)">
            {PHASE_LABELS[s.current_phase]}
          </Text>
        </>
      );
    }
    items.push({
      key: `session-${s.id}`,
      iso: s.updated_at,
      icon: Chat,
      tone: 'terracotta',
      node,
    });
  }

  return items
    .sort((a, b) => new Date(b.iso).getTime() - new Date(a.iso).getTime())
    .slice(0, 5);
}

export function DashboardPage() {
  const navigate = useNavigate();
  const meQuery = useMe();
  const sessionsQuery = useSessions();
  const resumesQuery = useResumes();

  const sessions = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data]);
  const resumes = useMemo(() => resumesQuery.data ?? [], [resumesQuery.data]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.status === 'active'),
    [sessions],
  );

  const recentResumes = useMemo(
    () =>
      [...resumes]
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        )
        .slice(0, 3),
    [resumes],
  );

  const activity = useMemo(
    () => buildActivity(resumes, sessions),
    [resumes, sessions],
  );

  const isLoading =
    meQuery.isLoading || sessionsQuery.isLoading || resumesQuery.isLoading;
  const isError =
    meQuery.isError || sessionsQuery.isError || resumesQuery.isError;
  const errorMessage =
    meQuery.error?.message ??
    sessionsQuery.error?.message ??
    resumesQuery.error?.message ??
    'Tente novamente em instantes.';

  const firstName = firstNameOf(meQuery.data?.full_name);

  if (isLoading) {
    return (
      <Center mih="60vh">
        <Loader color="terracotta" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center mih="60vh" px="md">
        <Alert color="red" title="Erro ao carregar o início" maw={520}>
          {errorMessage}
        </Alert>
      </Center>
    );
  }

  const isNewUser = sessions.length === 0 && resumes.length === 0;

  if (isNewUser) {
    return (
      <Box maw={1160} mx="auto" px={{ base: 'sm', lg: 'lg' }} py="md">
        <Text
          fz={11}
          fw={700}
          tt="uppercase"
          c="terracotta.6"
          mb={6}
          style={{ letterSpacing: '0.14em' }}
        >
          Bem-vindo ao Sieve
        </Text>
        <Title order={1} fz={28} fw={800} c="var(--mantine-color-text)" style={{ letterSpacing: '-0.02em' }}>
          Olá, {firstName} 👋
        </Title>
        <Text c="dimmed" mt={6} mb="xl" fz={15}>
          Vamos construir seu primeiro currículo profissional.
        </Text>
        <OnboardingCard />
      </Box>
    );
  }

  const topScore = bestScore(resumes);
  const topScoreColor =
    topScore !== null ? TONE_COLOR[scoreTone(topScore)] : 'gray';

  return (
    <Box maw={1160} mx="auto" px={{ base: 'sm', lg: 'lg' }} py="md">
      {/* Cabeçalho */}
      <Box mb="xl">
        <Text
          fz={11}
          fw={700}
          tt="uppercase"
          c="terracotta.6"
          mb={6}
          style={{ letterSpacing: '0.14em' }}
        >
          {capitalize(todayFormatter.format(new Date()))}
        </Text>
        <Title order={1} fz={28} fw={800} c="var(--mantine-color-text)" style={{ letterSpacing: '-0.02em' }}>
          Olá, {firstName} 👋
        </Title>
        <Text c="dimmed" mt={6} fz={15}>
          Acompanhe seus currículos e continue sua entrevista de onde parou.
        </Text>
      </Box>

      {/* Stat cards */}
      <Grid gutter="md" mb="lg">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <StatCard
            icon={File}
            label="Currículos"
            value={resumes.length}
            unit={resumes.length === 1 ? 'versão' : 'versões'}
            tone="terracotta"
            foot={
              <Text fz={12.5} c="dimmed">
                {recentResumes.length > 0 ? (
                  <>
                    Última atualização{' '}
                    <Text span fw={600} c="var(--mantine-color-text)">
                      {formatRelative(recentResumes[0].updated_at)}
                    </Text>
                  </>
                ) : (
                  'Nenhum currículo ainda'
                )}
              </Text>
            }
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <StatCard
            icon={Sparkles}
            label="Último score"
            value={topScore !== null ? topScore.toFixed(1) : '—'}
            unit={topScore !== null ? '/ 10' : undefined}
            tone="blue"
            foot={
              topScore !== null ? (
                <Group gap="sm" wrap="nowrap">
                  <Progress
                    value={topScore * 10}
                    color={topScoreColor}
                    size="sm"
                    radius="xl"
                    style={{ flex: 1 }}
                  />
                  <Text fz={12} fw={700} c={`${topScoreColor}.7`}>
                    {topScore >= 7.5 ? 'ótimo' : topScore >= 5 ? 'bom' : 'a melhorar'}
                  </Text>
                </Group>
              ) : (
                <Text fz={12.5} c="dimmed">
                  Disponível quando o primeiro currículo for avaliado
                </Text>
              )
            }
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <StatCard icon={Kanban} label="Candidaturas ativas" tone="green">
            <Text fz={13} c="dimmed" mt={4} lh={1.4}>
              Acompanhamento de candidaturas chega numa próxima fase.
            </Text>
          </StatCard>
        </Grid.Col>
      </Grid>

      {/* Hero: continuar entrevista (só se houver sessão ativa) */}
      {activeSession && <ContinueHero phase={activeSession.current_phase} />}

      <Grid gutter="xl">
        {/* Coluna principal */}
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <SectionLabel
            right={
              <UnstyledButton
                onClick={() => navigate('/resumes')}
                c="terracotta.7"
                fz={13}
                fw={700}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                Ver todos <ChevronRight size={14} />
              </UnstyledButton>
            }
          >
            Currículos recentes
          </SectionLabel>

          {recentResumes.length > 0 ? (
            <Stack gap="sm" mb="xl">
              {recentResumes.map((resume) => (
                <ResumeRow key={resume.id} resume={resume} />
              ))}
            </Stack>
          ) : (
            <Paper withBorder radius="lg" p="lg" mb="xl">
              <Text fz={14} c="dimmed">
                Você ainda não tem currículos. Finalize uma entrevista para gerar
                o primeiro.
              </Text>
            </Paper>
          )}

          <SectionLabel>Aderência às últimas vagas</SectionLabel>
          <ComingSoonPanel
            icon={Briefcase}
            title="Análise de aderência a vagas"
            description="Cole uma vaga e veja, em porcentagem, o quanto seu currículo combina com ela."
            badge="Em breve · Vagas"
          />
        </Grid.Col>

        {/* Coluna lateral */}
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <SectionLabel>Atividade recente</SectionLabel>
          {activity.length > 0 ? (
            <Paper withBorder radius="lg" p="xs">
              <Stack gap={0}>
                {activity.map((item) => (
                  <Group key={item.key} gap="md" wrap="nowrap" align="flex-start" p="sm">
                    <IconChip icon={item.icon} tone={item.tone} size={36} iconSize={16} />
                    <Box style={{ minWidth: 0 }} pt={2}>
                      <Text fz={13.5} c="light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-1))" lh={1.4}>
                        {item.node}
                      </Text>
                      <Text fz={11.5} c="dimmed" fw={500} mt={2}>
                        {formatRelative(item.iso)}
                      </Text>
                    </Box>
                  </Group>
                ))}
              </Stack>
            </Paper>
          ) : (
            <ComingSoonPanel
              icon={Sparkles}
              title="Sua atividade aparece aqui"
              description="Entrevistas e currículos avaliados vão alimentar este feed."
              badge="Em breve"
            />
          )}
        </Grid.Col>
      </Grid>
    </Box>
  );
}
