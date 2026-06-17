import { useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Center,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { Briefcase, Sparkles } from '@/components/atoms/Icon';
import { IconChip } from '@/components/atoms/IconChip';
import { useResumesForSelect } from '../../hooks/useResumesForSelect';
import { useJobList } from '../../hooks/useJobList';
import { useRunAnalysis, type RunAnalysisResult } from '../../hooks/useRunAnalysis';
import {
  JobInputForm,
  type JobFormValues,
} from '../../components/JobInputForm/JobInputForm';
import { MatchResult } from '../../components/MatchResult/MatchResult';
import { AnalyzedJobItem } from '../../components/AnalyzedJobItem/AnalyzedJobItem';

function PageHeader() {
  return (
    <Box>
      <Text
        fz={11}
        fw={700}
        tt="uppercase"
        c="terracotta.6"
        mb={6}
        style={{ letterSpacing: '0.14em' }}
      >
        Matching com vagas
      </Text>
      <Title
        order={1}
        fz={24}
        fw={800}
        c="var(--mantine-color-text)"
        style={{ letterSpacing: '-0.02em' }}
      >
        Vagas
      </Title>
    </Box>
  );
}

/** Estado "analisando" (porte do card de spinner do protótipo). */
function AnalyzingCard() {
  return (
    <Paper withBorder radius="lg" mih={420} style={{ display: 'grid', placeItems: 'center' }}>
      <Stack align="center" gap={6} py="xl">
        <Box
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 64,
            height: 64,
            borderRadius: 18,
            color: '#fff',
            marginBottom: 8,
            background:
              'linear-gradient(135deg, var(--mantine-color-terracotta-5), var(--mantine-color-terracotta-8))',
          }}
        >
          <Loader size={28} color="white" />
        </Box>
        <Text fz={15} fw={700} c="var(--mantine-color-text)">
          Analisando aderência…
        </Text>
        <Text fz={13} c="dimmed">
          Comparando os requisitos da vaga com seu currículo
        </Text>
      </Stack>
    </Paper>
  );
}

/** Painel vazio inicial (porte do `EmptyState` do `JobAnalyzer`). */
function EmptyResultPanel() {
  return (
    <Paper withBorder radius="lg" mih={420} style={{ display: 'grid', placeItems: 'center' }}>
      <Stack align="center" gap="sm" py="xl" px="lg">
        <IconChip icon={Briefcase} tone="terracotta" size={64} iconSize={28} />
        <Title order={3} fz={18} fw={700} c="var(--mantine-color-text)">
          Cole uma vaga para começar
        </Title>
        <Text c="dimmed" ta="center" maw={360} fz={14} lh={1.6}>
          O Sieve compara a vaga com seu currículo e mostra o score de aderência,
          as skills que batem e o que falta.
        </Text>
      </Stack>
    </Paper>
  );
}

function AnalyzeTab() {
  const resumesQuery = useResumesForSelect();
  const runAnalysis = useRunAnalysis();

  const [result, setResult] = useState<RunAnalysisResult | null>(null);

  const resumes = useMemo(() => resumesQuery.data ?? [], [resumesQuery.data]);
  const defaultResumeId = resumes[0]?.id ?? null;

  function handleSubmit(values: JobFormValues) {
    runAnalysis.mutate(values, {
      onSuccess: (data) => setResult(data),
    });
  }

  if (resumesQuery.isLoading) {
    return (
      <Center mih="40vh">
        <Loader color="terracotta" />
      </Center>
    );
  }

  if (resumesQuery.isError) {
    return (
      <Center mih="40vh" px="md">
        <Alert color="red" title="Erro ao carregar currículos" maw={520}>
          {resumesQuery.error.message}
        </Alert>
      </Center>
    );
  }

  return (
    <SimpleGrid
      cols={{ base: 1, lg: 2 }}
      spacing="lg"
      style={{ alignItems: 'start' }}
    >
      <JobInputForm
        resumes={resumes}
        defaultResumeId={defaultResumeId}
        analyzing={runAnalysis.isPending}
        onSubmit={handleSubmit}
      />

      <Box>
        {runAnalysis.isPending ? (
          <AnalyzingCard />
        ) : runAnalysis.isError ? (
          <Alert color="red" title="Falha na análise">
            {runAnalysis.error.message}
          </Alert>
        ) : result ? (
          <MatchResult analysis={result.analysis} />
        ) : (
          <EmptyResultPanel />
        )}
      </Box>
    </SimpleGrid>
  );
}

function AnalyzedTab() {
  const jobsQuery = useJobList();

  if (jobsQuery.isLoading) {
    return (
      <Center mih="40vh">
        <Loader color="terracotta" />
      </Center>
    );
  }

  if (jobsQuery.isError) {
    return (
      <Center mih="40vh" px="md">
        <Alert color="red" title="Erro ao carregar vagas" maw={520}>
          {jobsQuery.error.message}
        </Alert>
      </Center>
    );
  }

  const jobs = jobsQuery.data;

  if (jobs.length === 0) {
    return (
      <Paper withBorder radius="lg" p="xl">
        <Stack align="center" gap="sm" py={40}>
          <IconChip icon={Briefcase} tone="terracotta" size={64} iconSize={28} />
          <Title order={3} fz={18} fw={700} c="var(--mantine-color-text)">
            Nenhuma vaga analisada ainda
          </Title>
          <Text c="dimmed" ta="center" maw={360} fz={14} lh={1.6}>
            Analise uma vaga na aba ao lado e ela aparece aqui.
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="sm">
      {jobs.map((job) => (
        <AnalyzedJobItem key={job.id} job={job} />
      ))}
    </Stack>
  );
}

export function JobAnalysisPage() {
  const [tab, setTab] = useState<string>('new');
  const jobsQuery = useJobList();
  const jobCount = jobsQuery.data?.length ?? 0;

  return (
    <Box maw={1160} mx="auto" px={{ base: 'sm', lg: 'lg' }} py="md">
      <Group justify="space-between" align="flex-end" gap="md" mb="lg" wrap="wrap">
        <PageHeader />
        <Tabs
          value={tab}
          onChange={(v) => setTab(v ?? 'new')}
          variant="pills"
          color="terracotta"
        >
          <Tabs.List>
            <Tabs.Tab value="new" leftSection={<Sparkles size={15} />}>
              Analisar vaga
            </Tabs.Tab>
            <Tabs.Tab
              value="list"
              leftSection={<Briefcase size={15} />}
              rightSection={
                jobCount > 0 ? (
                  <Badge size="xs" variant="light" color="terracotta" circle>
                    {jobCount}
                  </Badge>
                ) : undefined
              }
            >
              Analisadas
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Group>

      {tab === 'new' ? <AnalyzeTab /> : <AnalyzedTab />}
    </Box>
  );
}
