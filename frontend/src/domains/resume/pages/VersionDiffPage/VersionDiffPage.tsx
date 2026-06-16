import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Box,
  Center,
  Group,
  Loader,
  Text,
  Title,
} from '@mantine/core';
import { ChevronRight } from '@/components/atoms/Icon';
import { DiffViewer } from '../../components/DiffViewer/DiffViewer';
import { useVersionDiff } from '../../hooks/useVersionDiff';

function parseVersion(value: string | undefined): number | null {
  if (value === undefined) return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}

export function VersionDiffPage() {
  const navigate = useNavigate();
  const { id, from, to } = useParams<{ id: string; from: string; to: string }>();
  const fromNumber = parseVersion(from);
  const toNumber = parseVersion(to);
  const diffQuery = useVersionDiff(id ?? null, fromNumber, toNumber);

  return (
    <Box maw={1160} mx="auto" px={{ base: 'sm', lg: 'lg' }} py="md">
      <Group gap={8} mb="md" fz={13} fw={600}>
        <Anchor c="dimmed" component="button" onClick={() => navigate('/resumes')}>
          Currículos
        </Anchor>
        <Box c="gray.4" style={{ display: 'flex' }}>
          <ChevronRight size={14} />
        </Box>
        {id && (
          <>
            <Anchor
              c="dimmed"
              component="button"
              onClick={() => navigate(`/resumes/${id}`)}
            >
              Detalhe
            </Anchor>
            <Box c="gray.4" style={{ display: 'flex' }}>
              <ChevronRight size={14} />
            </Box>
          </>
        )}
        <Text fz={13} fw={600} c="var(--mantine-color-text)">
          Comparar versões
        </Text>
      </Group>

      <Title
        order={1}
        fz={24}
        fw={800}
        mb="lg"
        c="var(--mantine-color-text)"
        style={{ letterSpacing: '-0.02em' }}
      >
        Comparar versões
      </Title>

      {diffQuery.isLoading ? (
        <Center mih="40vh">
          <Loader color="terracotta" />
        </Center>
      ) : diffQuery.isError || !diffQuery.data ? (
        <Center mih="40vh" px="md">
          <Alert color="red" title="Erro ao comparar versões" maw={520}>
            {diffQuery.error?.message ?? 'Diff indisponível.'}
          </Alert>
        </Center>
      ) : (
        <DiffViewer diff={diffQuery.data} />
      )}
    </Box>
  );
}
