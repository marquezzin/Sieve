import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Center,
  Group,
  Loader,
  Paper,
  Progress,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { Briefcase, Sparkles } from '@/components/atoms/Icon';
import { useJobList } from '../../hooks/useJobList';
import {
  MATCH_TONE_COLOR,
  matchTone,
  scorePercent,
  type JobPosting,
} from '../../types';
import { CompanyAvatar } from '../CompanyAvatar/CompanyAvatar';

interface JobAdherenceListProps {
  /** Quantas vagas mostrar (default 3). */
  limit?: number;
}

/** Linha: empresa + vaga + barra de aderência + %. Clicar leva pro matching. */
function AdherenceRow({ job }: { job: JobPosting & { top_score: number } }) {
  const navigate = useNavigate();
  const percent = scorePercent(job.top_score);
  const color = MATCH_TONE_COLOR[matchTone(percent)];

  return (
    <UnstyledButton
      onClick={() => navigate('/matching')}
      w="100%"
      p="sm"
      style={{ borderRadius: 12 }}
    >
      <Group gap="sm" wrap="nowrap" align="center">
        <CompanyAvatar company={job.company} size={36} />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fz={14} fw={700} c="var(--mantine-color-text)" truncate>
            {job.title}
          </Text>
          <Text fz={12.5} c="dimmed" truncate>
            {job.company}
          </Text>
        </Box>
        <Group gap="sm" wrap="nowrap" w={160} style={{ flexShrink: 0 }}>
          <Progress
            value={percent}
            color={color}
            size="sm"
            radius="xl"
            style={{ flex: 1 }}
          />
          <Text
            fz={13}
            fw={700}
            ff="monospace"
            c={`${color}.7`}
            w={36}
            ta="right"
          >
            {percent}%
          </Text>
        </Group>
      </Group>
    </UnstyledButton>
  );
}

/**
 * Widget "Aderência às últimas vagas" do dashboard: as vagas já analisadas com a
 * melhor aderência (`top_score`), barra + %. Consome `useJobList` (agora com
 * `top_score` anotado no backend). Self-contained — o dashboard só renderiza.
 */
export function JobAdherenceList({ limit = 3 }: JobAdherenceListProps) {
  const navigate = useNavigate();
  const jobsQuery = useJobList();

  if (jobsQuery.isLoading) {
    return (
      <Paper withBorder radius="lg" p="lg">
        <Center mih={120}>
          <Loader color="terracotta" size="sm" />
        </Center>
      </Paper>
    );
  }

  if (jobsQuery.isError) {
    return (
      <Alert color="red" title="Erro ao carregar aderência" radius="lg">
        {jobsQuery.error.message}
      </Alert>
    );
  }

  const analyzed = (jobsQuery.data ?? [])
    .filter((j): j is JobPosting & { top_score: number } => j.top_score !== null)
    .slice(0, limit);

  if (analyzed.length === 0) {
    return (
      <Paper withBorder radius="lg" p="lg">
        <Group gap="md" wrap="nowrap" align="center">
          <Box
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 44,
              height: 44,
              borderRadius: 12,
              flexShrink: 0,
              color: 'var(--mantine-color-terracotta-6)',
              background:
                'light-dark(var(--mantine-color-terracotta-0), var(--mantine-color-dark-5))',
            }}
          >
            <Briefcase size={20} />
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text fz={14} fw={700} c="var(--mantine-color-text)">
              Nenhuma vaga analisada ainda
            </Text>
            <Text fz={13} c="dimmed" lh={1.5}>
              Cole uma vaga e veja, em %, o quanto seu currículo combina com ela.
            </Text>
          </Box>
          <UnstyledButton
            onClick={() => navigate('/matching')}
            c="terracotta.7"
            fz={13}
            fw={700}
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Sparkles size={14} /> Analisar
          </UnstyledButton>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="lg" p="xs">
      <Stack gap={2}>
        {analyzed.map((job) => (
          <AdherenceRow key={job.id} job={job} />
        ))}
      </Stack>
    </Paper>
  );
}
