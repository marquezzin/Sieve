import type { ReactNode } from 'react';
import {
  Anchor,
  Box,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { CompanyAvatar } from '@/components/atoms/CompanyAvatar/CompanyAvatar';
import { Calendar, File, Link as LinkIcon } from '@/components/atoms/Icon';
import { formatRelative } from '@/lib/formatters';
import { KANBAN_COLUMNS, type Application } from '../../types';

const longDate = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

function formatApplied(date: string | null): string {
  if (!date) return 'Não informada';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return longDate.format(d);
}

interface ApplicationDetailModalProps {
  /** Candidatura a exibir; `null` mantém fechado. */
  app: Application | null;
  onClose: () => void;
}

/** Linha de metadado: ícone + rótulo + valor. */
function MetaRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Group gap={6} c="dimmed" mb={2} wrap="nowrap">
        {icon}
        <Text fz={11} fw={700} tt="uppercase" style={{ letterSpacing: '0.08em' }}>
          {label}
        </Text>
      </Group>
      <Box pl={20}>{children}</Box>
    </Box>
  );
}

/**
 * Detalhe (read-only) de uma candidatura. Abre ao clicar no card do Kanban —
 * mostra estágio, data, link, currículo vinculado e notas.
 */
export function ApplicationDetailModal({
  app,
  onClose,
}: ApplicationDetailModalProps) {
  const column = app
    ? KANBAN_COLUMNS.find((c) => c.status === app.status)
    : null;

  return (
    <Modal
      opened={Boolean(app)}
      onClose={onClose}
      size="lg"
      radius="lg"
      centered
      title={
        app ? (
          <Group gap="sm" wrap="nowrap" align="center" pr="md">
            <CompanyAvatar company={app.company} size={44} />
            <Box style={{ minWidth: 0 }}>
              <Text fz={17} fw={800} c="var(--mantine-color-text)" truncate>
                {app.position}
              </Text>
              <Text fz={13} fw={600} c="dimmed" truncate>
                {app.company}
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
      {app && (
        <Stack gap="lg">
          {/* Estágio */}
          {column && (
            <Group gap="xs" align="center">
              <Box
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 999,
                  background: column.tone,
                }}
              />
              <Text fz={14} fw={700} c="var(--mantine-color-text)">
                {column.label}
              </Text>
            </Group>
          )}

          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
            <MetaRow icon={<Calendar size={13} />} label="Data da aplicação">
              <Text fz={14} c="var(--mantine-color-text)">
                {formatApplied(app.applied_at)}
              </Text>
            </MetaRow>

            <MetaRow icon={<File size={13} />} label="Currículo usado">
              <Text fz={14} c={app.resume_version ? 'var(--mantine-color-text)' : 'dimmed'}>
                {app.resume_version ? 'Currículo vinculado' : 'Nenhum'}
              </Text>
            </MetaRow>

            <MetaRow icon={<LinkIcon size={13} />} label="Link da vaga">
              {app.link ? (
                <Anchor
                  href={app.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  fz={14}
                  c="terracotta.7"
                  fw={600}
                  style={{ wordBreak: 'break-all' }}
                >
                  {app.link}
                </Anchor>
              ) : (
                <Text fz={14} c="dimmed">
                  Não informado
                </Text>
              )}
            </MetaRow>

            <MetaRow icon={<Calendar size={13} />} label="Criada">
              <Text fz={14} c="var(--mantine-color-text)">
                {formatRelative(app.created_at)}
              </Text>
            </MetaRow>
          </SimpleGrid>

          {/* Notas */}
          <Box>
            <Text fz={11} fw={700} tt="uppercase" c="dimmed" mb={6} style={{ letterSpacing: '0.08em' }}>
              Notas
            </Text>
            {app.notes.trim() ? (
              <Paper withBorder radius="md" p="sm" bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))">
                <Text fz={14} lh={1.6} c="var(--mantine-color-text)" style={{ whiteSpace: 'pre-wrap' }}>
                  {app.notes}
                </Text>
              </Paper>
            ) : (
              <Text fz={13.5} c="dimmed">
                Sem notas.
              </Text>
            )}
          </Box>
        </Stack>
      )}
    </Modal>
  );
}
