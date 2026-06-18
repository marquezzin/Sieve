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
import { JobAnalysisModal } from '../../components/JobAnalysisModal/JobAnalysisModal';
import type { JobPosting } from '../../types';

function PageHeader() {
  return (
    <Box mb="lg">
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

/** Card de passo numerado (faixa horizontal "como funciona"). */
function HowItWorksStep({
  index,
  title,
  desc,
}: {
  index: number;
  title: string;
  desc: string;
}) {
  return (
    <Paper withBorder radius="md" p="md" h="100%">
      <Group gap="xs" align="center" mb={6} wrap="nowrap">
        <Box
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 26,
            height: 26,
            borderRadius: 999,
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 800,
            color: '#fff',
            background:
              'linear-gradient(135deg, var(--mantine-color-terracotta-5), var(--mantine-color-terracotta-7))',
            boxShadow: '0 2px 6px -2px var(--mantine-color-terracotta-7)',
          }}
        >
          {index}
        </Box>
        <Text fz={14} fw={700} c="var(--mantine-color-text)">
          {title}
        </Text>
      </Group>
      <Text fz={13} c="dimmed" lh={1.55}>
        {desc}
      </Text>
    </Paper>
  );
}

/**
 * Estado inicial (sem análise): faixa horizontal "como funciona" abaixo do form —
 * preenche a largura e elimina o vazio que sobrava ao lado do form.
 */
function HowItWorksStrip() {
  return (
    <Box>
      <Group gap="xs" align="center" mb="sm">
        <IconChip icon={Sparkles} tone="terracotta" size={34} iconSize={16} />
        <Box>
          <Text fz={14} fw={800} c="var(--mantine-color-text)">
            Aderência em 3 passos
          </Text>
          <Text fz={12} c="dimmed">
            Análise honesta, sem reescrever seu currículo.
          </Text>
        </Box>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
        <HowItWorksStep
          index={1}
          title="Cole a vaga"
          desc="Título, empresa e a descrição completa — quanto mais detalhe, melhor o matching."
        />
        <HowItWorksStep
          index={2}
          title="Escolha o currículo"
          desc="Comparamos a vaga com a versão mais recente do currículo escolhido."
        />
        <HowItWorksStep
          index={3}
          title="Veja a aderência"
          desc="Score, skills que batem e que faltam, e recomendações detalhadas pra mandar bem."
        />
      </SimpleGrid>
    </Box>
  );
}

/** Bloco "Analisar vaga": form + resultado da análise recém-rodada. */
function AnalyzeSection() {
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

  const form = (
    <JobInputForm
      resumes={resumes}
      defaultResumeId={defaultResumeId}
      analyzing={runAnalysis.isPending}
      onSubmit={handleSubmit}
    />
  );

  // Tem saída (rodando / erro / resultado)? layout 2 colunas (form + saída, ambas
  // altas, equilibradas). Estado inicial vazio → coluna única centrada com o form
  // em foco e os "3 passos" numa faixa abaixo — sem o vazio lateral.
  const output = runAnalysis.isPending ? (
    <AnalyzingCard />
  ) : runAnalysis.isError ? (
    <Alert color="red" title="Falha na análise">
      {runAnalysis.error.message}
    </Alert>
  ) : result ? (
    <MatchResult analysis={result.analysis} />
  ) : null;

  if (!output) {
    return (
      <Stack gap="lg" maw={760} mx="auto">
        {form}
        <HowItWorksStrip />
      </Stack>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" style={{ alignItems: 'start' }}>
      {form}
      <Box>{output}</Box>
    </SimpleGrid>
  );
}

/** Bloco "Vagas analisadas": lista; clicar abre o modal com a análise completa. */
function AnalyzedSection() {
  const jobsQuery = useJobList();
  const [openJob, setOpenJob] = useState<JobPosting | null>(null);

  const jobs = jobsQuery.data ?? [];

  return (
    <Box mt={40}>
      <Group gap="sm" align="center" mb="md">
        <Title order={2} fz={18} fw={800} c="var(--mantine-color-text)">
          Vagas analisadas
        </Title>
        {jobs.length > 0 && (
          <Badge variant="light" color="terracotta" size="sm">
            {jobs.length}
          </Badge>
        )}
      </Group>

      {jobsQuery.isLoading ? (
        <Center mih={160}>
          <Loader color="terracotta" />
        </Center>
      ) : jobsQuery.isError ? (
        <Alert color="red" title="Erro ao carregar vagas">
          {jobsQuery.error.message}
        </Alert>
      ) : jobs.length === 0 ? (
        <Paper withBorder radius="lg" p="xl">
          <Stack align="center" gap="sm" py={32}>
            <IconChip icon={Briefcase} tone="terracotta" size={56} iconSize={24} />
            <Title order={3} fz={16} fw={700} c="var(--mantine-color-text)">
              Nenhuma vaga analisada ainda
            </Title>
            <Text c="dimmed" ta="center" maw={360} fz={13} lh={1.6}>
              Analise uma vaga no formulário acima e ela aparece aqui.
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="sm">
          {jobs.map((job) => (
            <AnalyzedJobItem
              key={job.id}
              job={job}
              onOpen={() => setOpenJob(job)}
            />
          ))}
        </Stack>
      )}

      <JobAnalysisModal job={openJob} onClose={() => setOpenJob(null)} />
    </Box>
  );
}

export function JobAnalysisPage() {
  return (
    <Box maw={1160} mx="auto" px={{ base: 'sm', lg: 'lg' }} py="md">
      <PageHeader />
      <AnalyzeSection />
      <AnalyzedSection />
    </Box>
  );
}
