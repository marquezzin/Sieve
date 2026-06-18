import { useRef, type ComponentType } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Box,
  Button,
  Center,
  Grid,
  Group,
  Loader,
  Menu,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  Alert as AlertIcon,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Download,
  File,
  type IconProps,
  Lightbulb,
  PenLine,
  Refresh,
  Search,
  Sparkles,
  Stars,
} from '@/components/atoms/Icon';
import { ScoreGauge } from '../../components/ScoreGauge/ScoreGauge';
import { ScoreBreakdown } from '../../components/ScoreBreakdown/ScoreBreakdown';
import { ResumePreview } from '../../components/ResumePreview/ResumePreview';
import { VersionList } from '../../components/VersionList/VersionList';
import { useResume } from '../../hooks/useResume';
import { useDownloadPdf } from '../../hooks/useDownloadPdf';
import { useExportVisualPdf } from '../../hooks/useExportVisualPdf';
import {
  isGenerating,
  parseScore,
  type ResumeDetail,
  type ResumeStatus,
} from '../../types';

function Breadcrumb({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <Group gap={8} mb="md" fz={13} fw={600}>
      <Anchor c="dimmed" onClick={() => navigate('/resumes')} component="button">
        Currículos
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

function DetailHeader({ resume }: { resume: ResumeDetail }) {
  return (
    <Box mb="lg">
      <Title order={1} fz={24} fw={800} c="var(--mantine-color-text)" style={{ letterSpacing: '-0.02em' }}>
        {resume.title}
      </Title>
      <Text c="dimmed" mt={4} fz={14}>
        Cargo-alvo: {resume.target_role}
      </Text>
    </Box>
  );
}

/* ── Estado: pronto ── */

interface PipelineStep {
  label: string;
  agent: string;
  icon: ComponentType<IconProps>;
}

const PIPELINE: PipelineStep[] = [
  { label: 'Redigindo', agent: 'Agente Redator', icon: PenLine },
  { label: 'Revisando', agent: 'Agente Revisor', icon: Search },
  { label: 'Avaliando', agent: 'Agente Juiz', icon: Stars },
];

function DetailReady({ resume }: { resume: ResumeDetail }) {
  const downloadMutation = useDownloadPdf();
  const visualExport = useExportVisualPdf();
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  const version = resume.latest_version;
  const score = parseScore(version?.score?.overall ?? resume.latest_score);
  const versionNumber = resume.latest_version_number;
  const exporting = downloadMutation.isPending || visualExport.isPending;

  function exportVisual() {
    if (!previewRef.current) return;
    visualExport.mutate({
      node: previewRef.current,
      filename: `curriculo-${resume.id}-visual`,
    });
  }

  return (
    <Grid gutter="lg" align="start">
      <Grid.Col span={{ base: 12, lg: 8 }}>
        <Box ref={previewRef}>
          <ResumePreview data={version?.structured_data} />
        </Box>
      </Grid.Col>
      <Grid.Col span={{ base: 12, lg: 4 }}>
        <Stack gap="md" style={{ position: 'sticky', top: 16 }}>
          <Paper withBorder radius="lg" p="lg">
            <Stack align="center" gap="sm">
              {score !== null ? (
                <ScoreGauge score={score} size={150} />
              ) : (
                <Text c="dimmed" fz="sm" py="lg">
                  Sem score disponível.
                </Text>
              )}
              <Text fz={13} c="dimmed" ta="center">
                Avaliado pelo agente{' '}
                <Text span fw={600} c="var(--mantine-color-text)">
                  Juiz
                </Text>{' '}
                · pipeline completo
              </Text>
              <Menu position="bottom" width="target" radius="md" shadow="lg" withinPortal>
                <Menu.Target>
                  <Button
                    fullWidth
                    color="terracotta"
                    leftSection={<Download size={16} />}
                    rightSection={<ChevronDown size={15} />}
                    loading={exporting}
                    disabled={versionNumber === null}
                  >
                    Exportar PDF
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Escolha o modelo</Menu.Label>
                  <Menu.Item
                    leftSection={<File size={16} />}
                    onClick={() =>
                      versionNumber !== null &&
                      downloadMutation.mutate({ id: resume.id, versionNumber })
                    }
                  >
                    <Text fz={14} fw={600} c="var(--mantine-color-text)">
                      Modelo padrão (ATS)
                    </Text>
                    <Text fz={12} c="dimmed" lh={1.4}>
                      Sóbrio, preto no branco. Máxima compatibilidade com filtros.
                    </Text>
                  </Menu.Item>
                  <Menu.Item leftSection={<Sparkles size={16} />} onClick={exportVisual}>
                    <Text fz={14} fw={600} c="var(--mantine-color-text)">
                      Modelo visual
                    </Text>
                    <Text fz={12} c="dimmed" lh={1.4}>
                      Cópia fiel do card do Sieve, igual ao que você vê na tela.
                    </Text>
                  </Menu.Item>
                  <Menu.Divider />
                  <Box px="sm" py={8}>
                    <Group gap={6} align="flex-start" wrap="nowrap">
                      <Box c="terracotta.6" mt={1} style={{ flexShrink: 0 }}>
                        <Lightbulb size={13} />
                      </Box>
                      <Text fz={11.5} c="dimmed" lh={1.5}>
                        Modelos limpos costumam passar melhor pelos filtros (ATS) e
                        cansam menos o recrutador. O visual realça sua identidade —
                        bom pra candidaturas diretas. Na dúvida, o simples vai mais
                        longe.
                      </Text>
                    </Group>
                  </Box>
                </Menu.Dropdown>
              </Menu>
            </Stack>
          </Paper>

          {version?.score && (
            <Paper withBorder radius="lg" p="md">
              <Title order={3} fz={15} fw={700} mb="sm" c="var(--mantine-color-text)">
                Breakdown do score
              </Title>
              <ScoreBreakdown criteria={version.score.criteria} />
            </Paper>
          )}

          {version?.score && version.score.feedback.length > 0 && (
            <Paper withBorder radius="lg" p="md">
              <Title order={3} fz={15} fw={700} mb="sm" c="var(--mantine-color-text)">
                Feedback acionável
              </Title>
              <Stack gap="sm">
                {version.score.feedback.map((f, i) => (
                  <Group key={i} gap="sm" wrap="nowrap" align="flex-start">
                    <Box
                      c={f.tone === 'green' ? 'green.6' : f.tone === 'red' ? 'red.6' : 'yellow.6'}
                      style={{ display: 'flex', marginTop: 2 }}
                    >
                      {f.tone === 'green' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <Lightbulb size={16} />
                      )}
                    </Box>
                    <Text fz={13} lh={1.4} c="dimmed">
                      {f.text}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Paper>
          )}

          <Paper withBorder radius="lg" p="md">
            <Group justify="space-between" mb="sm">
              <Title order={3} fz={15} fw={700} c="var(--mantine-color-text)">
                Versões
              </Title>
              {resume.versions.length >= 2 && versionNumber !== null && (
                <Anchor
                  component="button"
                  fz={12.5}
                  fw={700}
                  c="terracotta.7"
                  onClick={() =>
                    navigate(
                      `/resumes/${resume.id}/diff/${versionNumber - 1}/${versionNumber}`,
                    )
                  }
                >
                  <Group gap={4} wrap="nowrap">
                    <Refresh size={13} /> Comparar
                  </Group>
                </Anchor>
              )}
            </Group>
            <VersionList
              versions={resume.versions}
              latestVersionNumber={versionNumber}
            />
          </Paper>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}

/* ── Estado: gerando ── */

function DetailGenerating({ status }: { status: ResumeStatus }) {
  // Mapeia o status do backend para o passo ativo do pipeline.
  const activeStep =
    status === 'generating' ? 0 : status === 'writer_done' ? 1 : 2;

  return (
    <Grid gutter="lg" align="start">
      <Grid.Col span={{ base: 12, lg: 8 }}>
        <ResumePreview skeleton />
      </Grid.Col>
      <Grid.Col span={{ base: 12, lg: 4 }}>
        <Paper withBorder radius="lg" p="lg" style={{ position: 'sticky', top: 16 }}>
          <Group gap={8} mb={4} align="center">
            <Box
              w={8}
              h={8}
              style={{
                borderRadius: 999,
                backgroundColor: 'var(--mantine-color-yellow-5)',
              }}
            />
            <Text
              fz={11}
              fw={700}
              tt="uppercase"
              c="yellow.7"
              style={{ letterSpacing: '0.12em' }}
            >
              Gerando currículo
            </Text>
          </Group>
          <Text fz={14} c="dimmed" mb="md">
            Um time de 3 agentes está construindo e avaliando seu currículo.
          </Text>
          <Stack gap={4}>
            {PIPELINE.map((step, i) => {
              const done = i < activeStep;
              const active = i === activeStep;
              const Icon = step.icon;
              return (
                <Group
                  key={step.label}
                  gap="sm"
                  wrap="nowrap"
                  px="xs"
                  py={10}
                  style={{
                    borderRadius: 12,
                    backgroundColor: active
                      ? 'light-dark(var(--mantine-color-yellow-0), rgba(240,140,0,.1))'
                      : undefined,
                  }}
                >
                  <ThemeIcon
                    size={40}
                    radius="md"
                    variant={done || active ? 'filled' : 'default'}
                    color={done ? 'green' : active ? 'yellow' : 'gray'}
                  >
                    {done ? (
                      <CheckCircle size={18} />
                    ) : active ? (
                      <Loader size={16} color="white" />
                    ) : (
                      <Icon size={17} />
                    )}
                  </ThemeIcon>
                  <Box>
                    <Text
                      fz={14}
                      fw={700}
                      c={done ? 'green.7' : active ? 'yellow.8' : 'dimmed'}
                    >
                      {step.label}
                    </Text>
                    <Text fz={12} c="dimmed">
                      {step.agent}
                    </Text>
                  </Box>
                </Group>
              );
            })}
          </Stack>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}

/* ── Estado: falhou ── */

function DetailFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <Paper withBorder radius="lg" p={48}>
      <Stack align="center" gap="xs" maw={420} mx="auto">
        <ThemeIcon size={64} radius="lg" color="red" variant="light">
          <AlertIcon size={28} />
        </ThemeIcon>
        <Title order={3} fz={20} fw={700} c="var(--mantine-color-text)" ta="center">
          Não foi possível gerar o currículo
        </Title>
        <Text c="dimmed" ta="center" fz={14} lh={1.6}>
          Um agente encontrou um erro ao processar suas respostas. Nenhum dado foi
          perdido — você pode tentar novamente.
        </Text>
        <Button mt="md" color="terracotta" leftSection={<Refresh size={16} />} onClick={onRetry}>
          Recarregar
        </Button>
      </Stack>
    </Paper>
  );
}

/* ── Página ── */

export function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const resumeQuery = useResume(id ?? null);

  if (resumeQuery.isLoading) {
    return (
      <Center mih="60vh">
        <Loader color="terracotta" />
      </Center>
    );
  }

  if (resumeQuery.isError || !resumeQuery.data) {
    return (
      <Center mih="60vh" px="md">
        <Alert color="red" title="Erro ao carregar o currículo" maw={520}>
          {resumeQuery.error?.message ?? 'Currículo indisponível.'}
        </Alert>
      </Center>
    );
  }

  const resume = resumeQuery.data;

  return (
    <Box maw={1160} mx="auto" px={{ base: 'sm', lg: 'lg' }} py="md">
      <Breadcrumb title={resume.title} />
      <DetailHeader resume={resume} />
      {resume.status === 'failed' ? (
        <DetailFailed onRetry={() => resumeQuery.refetch()} />
      ) : isGenerating(resume.status) ? (
        <DetailGenerating status={resume.status} />
      ) : (
        <DetailReady resume={resume} />
      )}
    </Box>
  );
}
