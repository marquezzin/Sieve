import { useDroppable } from '@dnd-kit/core';
import { Badge, Box, Group, Stack, Text } from '@mantine/core';
import { Kanban } from '@/components/atoms/Icon';
import { ApplicationCard } from '../ApplicationCard/ApplicationCard';
import type { Application, KanbanColumnDef } from '../../types';

interface KanbanColumnProps {
  column: KanbanColumnDef;
  cards: Application[];
  onOpenCard: (app: Application) => void;
  onDeleteCard: (app: Application) => void;
}

/** Coluna do board (drop zone). Header com cor de acento + contador. */
export function KanbanColumn({
  column,
  cards,
  onOpenCard,
  onDeleteCard,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 280,
        flexShrink: 0,
        borderRadius: 16,
        transition: 'background-color .15s ease, box-shadow .15s ease',
        backgroundColor: isOver
          ? 'light-dark(var(--mantine-color-terracotta-0), var(--mantine-color-dark-5))'
          : 'light-dark(rgba(0,0,0,.025), rgba(255,255,255,.03))',
        boxShadow: isOver
          ? 'inset 0 0 0 2px var(--mantine-color-terracotta-3)'
          : 'none',
      }}
    >
      {/* Header */}
      <Group
        gap="xs"
        align="center"
        px="sm"
        py="sm"
        wrap="nowrap"
        style={{
          borderBottom: `2px solid ${column.tone}`,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <Box
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            flexShrink: 0,
            background: column.tone,
          }}
        />
        <Text fz={13} fw={700} c="var(--mantine-color-text)" style={{ flex: 1 }} truncate>
          {column.label}
        </Text>
        <Badge
          size="sm"
          variant="default"
          radius="xl"
          styles={{ label: { fontVariantNumeric: 'tabular-nums', fontWeight: 700 } }}
        >
          {cards.length}
        </Badge>
      </Group>

      {/* Corpo (drop zone) */}
      <Box
        ref={setNodeRef}
        p="xs"
        style={{ flex: 1, minHeight: 140, overflowY: 'auto' }}
      >
        {cards.length === 0 ? (
          <Stack
            align="center"
            justify="center"
            gap={4}
            py={32}
            px="sm"
            style={{
              borderRadius: 12,
              border: '2px dashed light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
            }}
          >
            <Box c="gray.4">
              <Kanban size={20} />
            </Box>
            <Text fz={12} c="dimmed">
              {isOver ? 'Solte aqui' : 'Vazio'}
            </Text>
          </Stack>
        ) : (
          <Stack gap="xs">
            {cards.map((card) => (
              <ApplicationCard
                key={card.id}
                app={card}
                onOpen={() => onOpenCard(card)}
                onDelete={() => onDeleteCard(card)}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
