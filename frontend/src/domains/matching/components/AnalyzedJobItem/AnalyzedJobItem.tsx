import { Box, Group, Paper, Stack, Text } from '@mantine/core';
import { ChevronRight } from '@/components/atoms/Icon';
import { formatRelative } from '@/lib/formatters';
import { CompanyAvatar } from '../CompanyAvatar/CompanyAvatar';
import type { JobPosting } from '../../types';

interface AnalyzedJobItemProps {
  job: JobPosting;
  onOpen: () => void;
}

/**
 * Item da lista "Vagas analisadas". Clicar **abre o modal** com a análise completa
 * (`JobAnalysisModal`) — a página controla qual vaga está aberta.
 */
export function AnalyzedJobItem({ job, onOpen }: AnalyzedJobItemProps) {
  const keywordPreview = job.extracted_keywords.slice(0, 4);

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      <Group gap="md" wrap="nowrap" align="center">
        <CompanyAvatar company={job.company} />
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={700} c="var(--mantine-color-text)" truncate>
            {job.title}
          </Text>
          <Text fz={13} c="dimmed" truncate>
            {job.company} · {formatRelative(job.created_at)}
          </Text>
          {keywordPreview.length > 0 && (
            <Text fz={12} c="dimmed" truncate mt={2}>
              {keywordPreview.join(' · ')}
              {job.extracted_keywords.length > keywordPreview.length
                ? ' …'
                : ''}
            </Text>
          )}
        </Stack>
        <Box c="gray.5" style={{ flexShrink: 0, display: 'grid' }}>
          <ChevronRight size={16} />
        </Box>
      </Group>
    </Paper>
  );
}
