import type { CSSProperties, PointerEvent } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ActionIcon, Badge, Box, Group, Paper, Text } from '@mantine/core';
import { CompanyAvatar } from '@/components/atoms/CompanyAvatar/CompanyAvatar';
import { Calendar, GripVertical, Link as LinkIcon, Trash } from '@/components/atoms/Icon';
import type { Application } from '../../types';

const shortDate = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
});

/** "02 de mai" → "02 mai". `null` vira "sem data". */
function formatApplied(date: string | null): string {
  if (!date) return 'sem data';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return shortDate.format(d).replace('.', '');
}

interface ApplicationCardViewProps {
  app: Application;
  /** Renderização "flutuante" no DragOverlay (sem o ícone de grip ativo). */
  overlay?: boolean;
  onDelete?: () => void;
}

/** Visual puro do card — usado tanto na coluna quanto no DragOverlay. */
export function ApplicationCardView({
  app,
  overlay = false,
  onDelete,
}: ApplicationCardViewProps) {
  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      shadow={overlay ? 'lg' : 'xs'}
      style={{
        cursor: overlay ? 'grabbing' : 'grab',
        transform: overlay ? 'rotate(2deg)' : undefined,
        background: 'light-dark(#fff, var(--mantine-color-dark-6))',
      }}
    >
      <Group gap="xs" align="flex-start" wrap="nowrap">
        <CompanyAvatar company={app.company} size={34} />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fz={13.5} fw={700} c="var(--mantine-color-text)" lh={1.25} truncate>
            {app.company}
          </Text>
          <Text fz={12} c="dimmed" truncate>
            {app.position}
          </Text>
        </Box>
        <Box c="gray.4" style={{ display: 'grid', flexShrink: 0 }}>
          <GripVertical size={16} />
        </Box>
      </Group>

      <Group
        justify="space-between"
        align="center"
        mt="sm"
        pt="sm"
        wrap="nowrap"
        style={{
          borderTop:
            '1px solid light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-4))',
        }}
      >
        <Group gap={6} wrap="nowrap" c="dimmed">
          <Calendar size={12} />
          <Text fz={11} fw={500} c="dimmed">
            {formatApplied(app.applied_at)}
          </Text>
        </Group>
        <Group gap={4} wrap="nowrap" align="center">
          {app.link && (
            <ActionIcon
              component="a"
              href={app.link}
              target="_blank"
              rel="noopener noreferrer"
              variant="subtle"
              color="gray"
              size="sm"
              radius="md"
              aria-label="Abrir vaga"
              onPointerDown={(e: PointerEvent) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <LinkIcon size={13} />
            </ActionIcon>
          )}
          {app.resume_version && (
            <Badge size="xs" variant="light" color="terracotta" tt="none">
              CV
            </Badge>
          )}
          {!overlay && onDelete && (
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              radius="md"
              aria-label="Remover candidatura"
              onPointerDown={(e: PointerEvent) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash size={13} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </Paper>
  );
}

interface ApplicationCardProps {
  app: Application;
  /** Clique (sem arrastar) abre o detalhe da candidatura. */
  onOpen: () => void;
  onDelete: () => void;
}

/** Card arrastável (wrapper @dnd-kit). O visual mora em `ApplicationCardView`. */
export function ApplicationCard({ app, onOpen, onDelete }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: app.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : 1,
    touchAction: 'none',
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      onClick={onOpen}
      {...attributes}
      {...listeners}
    >
      <ApplicationCardView app={app} onDelete={onDelete} />
    </Box>
  );
}
