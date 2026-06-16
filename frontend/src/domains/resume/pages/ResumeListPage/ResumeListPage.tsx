import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  Chat,
  File,
  Refresh,
  Sparkles,
} from '@/components/atoms/Icon';
import { IconChip } from '@/components/atoms/IconChip';
import { formatRelative } from '@/lib/formatters';
import { useResumes } from '../../hooks/useResumes';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { isGenerating, parseScore, scoreTone, TONE_COLOR, type Resume } from '../../types';

function PageHeader({ count }: { count: number }) {
  return (
    <Box mb={24}>
      <Text
        fz={11}
        fw={700}
        tt="uppercase"
        c="terracotta.6"
        mb={6}
        style={{ letterSpacing: '0.14em' }}
      >
        Carreira
      </Text>
      <Title
        order={1}
        fz={24}
        fw={800}
        c="var(--mantine-color-text)"
        style={{ letterSpacing: '-0.02em' }}
      >
        Currículos
      </Title>
      <Text c="dimmed" mt={6} fz={14}>
        {count === 1 ? '1 currículo' : `${count} currículos`}
      </Text>
    </Box>
  );
}

function ResumeCard({ resume }: { resume: Resume }) {
  const navigate = useNavigate();
  const ready = resume.status === 'ready';
  const generating = isGenerating(resume.status);
  const failed = resume.status === 'failed';
  const score = parseScore(resume.latest_score);
  const scoreColor = score !== null ? TONE_COLOR[scoreTone(score)] : 'gray';

  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      style={{
        cursor: ready ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      onClick={() => ready && navigate(`/resumes/${resume.id}`)}
    >
      <Group justify="space-between" align="flex-start" mb="md">
        <IconChip icon={File} tone="terracotta" size={44} iconSize={20} />
        <StatusBadge status={resume.status} />
      </Group>

      <Text fw={700} c="var(--mantine-color-text)" lh={1.3}>
        {resume.title}
      </Text>
      <Text fz={13} c="dimmed" mt={4}>
        {resume.target_role}
      </Text>

      <Box style={{ flex: 1 }} />
      <Divider my="md" />
      <Group justify="space-between" wrap="nowrap">
        {ready && (
          <Group gap={6} wrap="nowrap" align="baseline">
            <Text ff="monospace" fz={18} fw={600} c={`${scoreColor}.7`}>
              {score !== null ? score.toFixed(1) : '—'}
            </Text>
            <Text fz="xs" fw={600} c="dimmed">
              /10
            </Text>
          </Group>
        )}
        {generating && (
          <Group gap={6} wrap="nowrap">
            <Loader size={14} color="yellow" />
            <Text fz={12} fw={600} c="yellow.7">
              avaliando…
            </Text>
          </Group>
        )}
        {failed && (
          <Group gap={4} wrap="nowrap" c="red.6">
            <Refresh size={13} />
            <Text fz={12} fw={700} c="red.6">
              Tentar de novo
            </Text>
          </Group>
        )}
        <Text fz={11.5} c="dimmed" style={{ flexShrink: 0 }}>
          {formatRelative(resume.updated_at)}
        </Text>
      </Group>
    </Paper>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <Paper withBorder radius="lg" p="xl">
      <Stack align="center" gap="sm" py={40} px="md">
        <Box
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 64,
            height: 64,
            borderRadius: 16,
            color: 'var(--mantine-color-terracotta-6)',
            background:
              'light-dark(linear-gradient(180deg, var(--mantine-color-terracotta-0), #fff), var(--mantine-color-dark-6))',
            border: '1px solid var(--mantine-color-terracotta-1)',
          }}
        >
          <Chat size={28} />
        </Box>
        <Title order={3} fz={18} fw={700} c="var(--mantine-color-text)">
          Nenhum currículo ainda
        </Title>
        <Text c="dimmed" ta="center" maw={360} fz={14} lh={1.6}>
          Inicie uma conversa com o entrevistador e seu primeiro currículo aparece
          aqui, já avaliado de 0 a 10.
        </Text>
        <Button
          color="terracotta"
          mt="xs"
          leftSection={<Sparkles size={16} />}
          onClick={() => navigate('/chat')}
        >
          Iniciar entrevista
        </Button>
      </Stack>
    </Paper>
  );
}

export function ResumeListPage() {
  const resumesQuery = useResumes();

  return (
    <Box maw={1160} mx="auto" px={{ base: 'sm', lg: 'lg' }} py="md">
      {resumesQuery.isLoading ? (
        <Center mih="60vh">
          <Loader color="terracotta" />
        </Center>
      ) : resumesQuery.isError ? (
        <Center mih="60vh" px="md">
          <Alert color="red" title="Erro ao carregar currículos" maw={520}>
            {resumesQuery.error.message}
          </Alert>
        </Center>
      ) : (
        <>
          <PageHeader count={resumesQuery.data.length} />
          {resumesQuery.data.length === 0 ? (
            <EmptyState />
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {resumesQuery.data.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </Box>
  );
}
