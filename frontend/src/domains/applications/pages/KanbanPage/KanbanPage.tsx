import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  Alert,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Text,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { Plus } from '@/components/atoms/Icon';
import { useApplications } from '../../hooks/useApplications';
import { useMoveApplication } from '../../hooks/useMoveApplication';
import { useCreateApplication } from '../../hooks/useCreateApplication';
import { useDeleteApplication } from '../../hooks/useDeleteApplication';
import { KanbanColumn } from '../../components/KanbanColumn/KanbanColumn';
import { ApplicationCardView } from '../../components/ApplicationCard/ApplicationCard';
import { CreateApplicationModal } from '../../components/CreateApplicationModal/CreateApplicationModal';
import { ApplicationDetailModal } from '../../components/ApplicationDetailModal/ApplicationDetailModal';
import {
  KANBAN_COLUMNS,
  type Application,
  type ApplicationStatus,
} from '../../types';

function PageHeader({
  total,
  onNew,
}: {
  total: number;
  onNew: () => void;
}) {
  return (
    <Group justify="space-between" align="flex-end" gap="md" mb="lg" wrap="wrap">
      <Box>
        <Text
          fz={11}
          fw={700}
          tt="uppercase"
          c="terracotta.6"
          mb={6}
          style={{ letterSpacing: '0.14em' }}
        >
          Funil de candidaturas
        </Text>
        <Title
          order={1}
          fz={24}
          fw={800}
          c="var(--mantine-color-text)"
          style={{ letterSpacing: '-0.02em' }}
        >
          Candidaturas
        </Title>
      </Box>
      <Group gap="md" align="center">
        {total > 0 && (
          <Text fz={12.5} c="dimmed" fw={500} visibleFrom="sm">
            {total} no total · arraste entre colunas
          </Text>
        )}
        <Button color="terracotta" leftSection={<Plus size={16} />} onClick={onNew}>
          Nova candidatura
        </Button>
      </Group>
    </Group>
  );
}

export function KanbanPage() {
  const applicationsQuery = useApplications();
  const moveApplication = useMoveApplication();
  const createApplication = useCreateApplication();
  const deleteApplication = useDeleteApplication();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailApp, setDetailApp] = useState<Application | null>(null);

  /** Confirma antes de remover — não apaga direto. */
  function confirmDelete(app: Application) {
    modals.openConfirmModal({
      title: 'Remover candidatura',
      centered: true,
      children: (
        <Text fz={14} c="dimmed" lh={1.6}>
          Remover <Text span fw={700} c="var(--mantine-color-text)">{app.position}</Text> ·{' '}
          {app.company} do seu funil? Essa ação não pode ser desfeita.
        </Text>
      ),
      labels: { confirm: 'Remover', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteApplication.mutate(app.id),
    });
  }

  const sensors = useSensors(
    // distance ativa o drag só após mover 6px — clique em botão (link/excluir)
    // não inicia arraste.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const cards = useMemo(
    () => applicationsQuery.data ?? [],
    [applicationsQuery.data],
  );

  const cardsByStatus = useMemo(() => {
    const map = new Map<ApplicationStatus, Application[]>();
    for (const col of KANBAN_COLUMNS) map.set(col.status, []);
    for (const card of cards) map.get(card.status)?.push(card);
    return map;
  }, [cards]);

  const activeCard = activeId
    ? cards.find((c) => c.id === activeId) ?? null
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const cardId = String(active.id);
    const targetStatus = over.id as ApplicationStatus;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.status === targetStatus) return;
    moveApplication.mutate({ id: cardId, status: targetStatus });
  }

  if (applicationsQuery.isLoading) {
    return (
      <Center mih="60vh">
        <Loader color="terracotta" />
      </Center>
    );
  }

  if (applicationsQuery.isError) {
    return (
      <Center mih="60vh" px="md">
        <Alert color="red" title="Erro ao carregar candidaturas" maw={520}>
          {applicationsQuery.error.message}
        </Alert>
      </Center>
    );
  }

  return (
    <Box px={{ base: 'sm', lg: 'lg' }} py="md">
      <PageHeader total={cards.length} onNew={() => setModalOpen(true)} />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <Box style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: 8 }}>
          <Group gap="md" align="stretch" wrap="nowrap" style={{ minWidth: 'max-content' }}>
            {KANBAN_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                column={col}
                cards={cardsByStatus.get(col.status) ?? []}
                onOpenCard={setDetailApp}
                onDeleteCard={confirmDelete}
              />
            ))}
          </Group>
        </Box>

        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <Box style={{ width: 264 }}>
              <ApplicationCardView app={activeCard} overlay />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateApplicationModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        submitting={createApplication.isPending}
        onSubmit={async (input) => {
          await createApplication.mutateAsync(input);
          setModalOpen(false);
        }}
      />

      <ApplicationDetailModal
        app={detailApp}
        onClose={() => setDetailApp(null)}
      />
    </Box>
  );
}
