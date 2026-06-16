import { Badge, Box } from '@mantine/core';
import type { ResumeStatus } from '../../types';

interface StatusBadgeProps {
  status: ResumeStatus;
}

interface StatusVisual {
  color: string;
  label: string;
}

/**
 * Badge de status do currículo. Os estados intermediários do pipeline
 * (writer_done / reviewer_done) aparecem visualmente como "Gerando".
 */
const STATUS_MAP: Record<ResumeStatus, StatusVisual> = {
  generating: { color: 'yellow', label: 'Gerando' },
  writer_done: { color: 'yellow', label: 'Gerando' },
  reviewer_done: { color: 'yellow', label: 'Gerando' },
  ready: { color: 'green', label: 'Pronto' },
  failed: { color: 'red', label: 'Falhou' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const visual = STATUS_MAP[status];
  return (
    <Badge
      color={visual.color}
      variant="light"
      radius="sm"
      tt="none"
      fw={700}
      leftSection={
        <Box
          w={6}
          h={6}
          style={{
            borderRadius: '50%',
            backgroundColor: `var(--mantine-color-${visual.color}-6)`,
          }}
        />
      }
    >
      {visual.label}
    </Badge>
  );
}
