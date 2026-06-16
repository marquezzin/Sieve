import { Badge } from '@mantine/core';
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
    <Badge color={visual.color} variant="dot" radius="sm">
      {visual.label}
    </Badge>
  );
}
