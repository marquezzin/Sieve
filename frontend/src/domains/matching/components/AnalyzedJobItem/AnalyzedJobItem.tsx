import { useNavigate } from 'react-router-dom';
import { Box, Group, Paper, Stack, Text } from '@mantine/core';
import { Briefcase, ChevronRight } from '@/components/atoms/Icon';
import { formatRelative } from '@/lib/formatters';
import type { JobPosting } from '../../types';

interface AnalyzedJobItemProps {
  job: JobPosting;
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
        width: 42,
        height: 42,
        borderRadius: 12,
        flexShrink: 0,
        color: '#fff',
        fontSize: 14,
        fontWeight: 700,
        background: 'linear-gradient(135deg, #c6bdac, #574f43)',
      }}
    >
      {initials || <Briefcase size={18} />}
    </Box>
  );
}

/**
 * Item da lista "Analisadas" (porte do card do `JobsAnalyzed`). Clicar abre o
 * detalhe da vaga (`/matching/jobs/{id}`) com a análise mais recente. A barra de
 * score do protótipo dependia de um match salvo por vaga (não exposto pela lista)
 * — aqui mostramos as keywords extraídas, que é o sinal que a lista carrega.
 */
export function AnalyzedJobItem({ job }: AnalyzedJobItemProps) {
  const navigate = useNavigate();
  const keywordPreview = job.extracted_keywords.slice(0, 4);

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/matching/jobs/${job.id}`)}
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
              {job.extracted_keywords.length > keywordPreview.length ? ' …' : ''}
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
