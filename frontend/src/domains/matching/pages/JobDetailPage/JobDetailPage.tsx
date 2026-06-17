import { useNavigate, useParams } from 'react-router-dom';
import {
  Anchor,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Briefcase, ChevronRight, Sparkles } from '@/components/atoms/Icon';
import { IconChip } from '@/components/atoms/IconChip';
import { formatRelative } from '@/lib/formatters';
import { useJob } from '../../hooks/useJob';
import { MatchResult } from '../../components/MatchResult/MatchResult';
import type { JobPostingDetail } from '../../types';

function Breadcrumb({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <Group gap={8} mb="md" fz={13} fw={600}>
      <Anchor c="dimmed" onClick={() => navigate('/matching')} component="button">
        Analisadas
      </Anchor>
      <Box c="gray.4" style={{ display: 'flex' }}>
        <ChevronRight size={14} />
      </Box>
      <Text fz={13} fw={600} c="var(--mantine-color-text)" truncate>
        {title}
      </Text>
    </Group>
  );
}

/** Avatar quadrado com as iniciais da empresa (gradiente neutro do protótipo). */
function CompanyAvatar({ company }: { company: string }) {
  const initials = company
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <Box
      style={{
        display: 'grid',
        placeItems: 'center',
        width: 52,
        height: 52,
        borderRadius: 14,
        flexShrink: 0,
        color: '#fff',
        fontSize: 17,
        fontWeight: 700,
        background: 'linear-gradient(135deg, #c6bdac, #574f43)',
      }}
    >
      {initials || <Briefcase size={22} />}
    </Box>
  );
}

function DetailHeader({ job }: { job: JobPostingDetail }) {
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
        Vaga analisada · {formatRelative(job.created_at)}
      </Text>
      <Title
        order={1}
        fz={24}
        fw={800}
        c="var(--mantine-color-text)"
        style={{ letterSpacing: '-0.02em' }}
      >
        {job.title}
      </Title>
      <Group gap="sm" mt="sm" wrap="nowrap" align="center">
        <CompanyAvatar company={job.company} />
        <Text fz={18} fw={700} c="var(--mantine-color-text)" truncate>
          {job.company}
        </Text>
      </Group>
    </Box>
  );
}

/** Painel vazio: vaga sem análises ainda. */
function NoAnalysisPanel() {
  const navigate = useNavigate();
  return (
    <Paper withBorder radius="lg" mih={360} style={{ display: 'grid', placeItems: 'center' }}>
      <Stack align="center" gap="sm" py="xl" px="lg">
        <IconChip icon={Briefcase} tone="terracotta" size={64} iconSize={28} />
        <Title order={3} fz={18} fw={700} c="var(--mantine-color-text)">
          Esta vaga ainda não foi analisada
        </Title>
        <Text c="dimmed" ta="center" maw={360} fz={14} lh={1.6}>
          Rode uma análise contra um dos seus currículos para ver o score de
          aderência, as skills que batem e o que falta.
        </Text>
        <Button
          color="terracotta"
          leftSection={<Sparkles size={15} />}
          onClick={() => navigate('/matching')}
          mt="xs"
        >
          Analisar vaga
        </Button>
      </Stack>
    </Paper>
  );
}

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobQuery = useJob(id ?? null);

  if (jobQuery.isLoading) {
    return (
      <Center mih="60vh">
        <Loader color="terracotta" />
      </Center>
    );
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <Center mih="60vh" px="md">
        <Stack align="center" gap="sm" maw={420}>
          <IconChip icon={Briefcase} tone="terracotta" size={64} iconSize={28} />
          <Title order={3} fz={18} fw={700} c="var(--mantine-color-text)">
            Vaga não encontrada
          </Title>
          <Text c="dimmed" ta="center" fz={14} lh={1.6}>
            Não consegui carregar esta vaga. Ela pode ter sido removida.
          </Text>
          <Button color="terracotta" variant="light" onClick={() => navigate('/matching')} mt="xs">
            Voltar para Analisadas
          </Button>
        </Stack>
      </Center>
    );
  }

  const job = jobQuery.data;
  const latest = job.analyses[0];

  return (
    <Box maw={1160} mx="auto" px={{ base: 'sm', lg: 'lg' }} py="md">
      <Breadcrumb title={job.title} />
      <DetailHeader job={job} />
      {latest ? <MatchResult analysis={latest} /> : <NoAnalysisPanel />}
    </Box>
  );
}
