import {
  Alert,
  Box,
  Center,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Sparkles } from '@/components/atoms/Icon';
import { IconChip } from '@/components/atoms/IconChip';
import { formatRelative } from '@/lib/formatters';
import { useJob } from '../../hooks/useJob';
import { MatchResult } from '../MatchResult/MatchResult';
import { CompanyAvatar } from '../CompanyAvatar/CompanyAvatar';
import type { JobPosting } from '../../types';

interface JobAnalysisModalProps {
  /** Vaga a exibir; `null` mantém o modal fechado. */
  job: JobPosting | null;
  onClose: () => void;
}

/** Conteúdo do corpo: carrega o detalhe (com `analyses`) e renderiza a análise. */
function ModalBody({ jobId }: { jobId: string }) {
  const jobQuery = useJob(jobId);

  if (jobQuery.isPending) {
    return (
      <Center mih={240}>
        <Loader color="terracotta" />
      </Center>
    );
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <Alert color="red" title="Falha ao carregar a análise" radius="md">
        {jobQuery.error?.message ?? 'Tente novamente em instantes.'}
      </Alert>
    );
  }

  const latest = jobQuery.data.analyses[0];
  if (!latest) {
    return (
      <Stack align="center" gap="xs" py={40} px="md">
        <IconChip icon={Sparkles} tone="terracotta" size={56} iconSize={24} />
        <Title order={4} fz={16} fw={700} c="var(--mantine-color-text)">
          Esta vaga ainda não foi analisada
        </Title>
        <Text c="dimmed" ta="center" maw={380} fz={13.5} lh={1.6}>
          Use o formulário de análise para comparar esta vaga com um dos seus
          currículos.
        </Text>
      </Stack>
    );
  }

  return <MatchResult analysis={latest} />;
}

/**
 * Modal com a análise completa de uma vaga. O header (avatar + título + empresa)
 * aparece na hora a partir do `job` da lista; o corpo carrega a análise sob demanda.
 */
export function JobAnalysisModal({ job, onClose }: JobAnalysisModalProps) {
  const opened = Boolean(job);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      radius="lg"
      centered
      title={
        job ? (
          <Group gap="sm" wrap="nowrap" align="center" pr="md">
            <CompanyAvatar company={job.company} size={44} />
            <Box style={{ minWidth: 0 }}>
              <Text
                fz={10.5}
                fw={700}
                tt="uppercase"
                c="terracotta.6"
                style={{ letterSpacing: '0.12em' }}
              >
                Vaga analisada · {formatRelative(job.created_at)}
              </Text>
              <Text fz={17} fw={800} c="var(--mantine-color-text)" truncate>
                {job.title}
              </Text>
              <Text fz={13} fw={600} c="dimmed" truncate>
                {job.company}
              </Text>
            </Box>
          </Group>
        ) : null
      }
      styles={{
        title: { flex: 1, minWidth: 0 },
        header: { alignItems: 'flex-start' },
      }}
    >
      {job && <ModalBody jobId={job.id} />}
    </Modal>
  );
}
