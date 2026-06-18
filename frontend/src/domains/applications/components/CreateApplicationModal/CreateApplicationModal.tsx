import { useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Anchor,
  Button,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Calendar, Plus } from '@/components/atoms/Icon';
import { useResumesForSelect } from '../../hooks/useResumesForSelect';
import { getResumeLatestVersion, type ResumeOption } from '../../api/resumes';
import type { CreateApplicationInput } from '../../types';

// Empresa diferente do empregador atual do João (Nubank) — exemplo neutro.
const SAMPLE = {
  company: 'Stone',
  position: 'Pessoa Desenvolvedora Backend Sênior (Python)',
  link: 'https://stone.gupy.io/jobs/exemplo',
  notes: 'Recrutadora: Ana Souza · indicação do João. Processo via Gupy.',
};

/** Data de hoje em ISO `YYYY-MM-DD` (formato que o DatePickerInput usa). */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface CreateApplicationModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (input: CreateApplicationInput) => Promise<unknown>;
  submitting: boolean;
}

interface FormValues {
  company: string;
  position: string;
  link: string;
  /** ISO "YYYY-MM-DD" (string que o DatePickerInput v9 usa) ou null. */
  applied_at: string | null;
  resume_id: string;
  notes: string;
}

/** Rótulo do currículo no seletor: título · cargo-alvo. */
function resumeLabel(r: ResumeOption): string {
  return r.target_role ? `${r.title} · ${r.target_role}` : r.title;
}

/**
 * Modal "Nova candidatura" (porte do `NewApplicationModal`): empresa + cargo
 * obrigatórios; link, data, currículo e notas opcionais. O currículo escolhido é
 * resolvido pra sua última versão (`resume_version_id`) no submit.
 */
export function CreateApplicationModal({
  opened,
  onClose,
  onSubmit,
  submitting,
}: CreateApplicationModalProps) {
  const resumesQuery = useResumesForSelect();
  const [resolving, setResolving] = useState(false);

  const form = useForm<FormValues>({
    initialValues: {
      company: '',
      position: '',
      link: '',
      applied_at: null,
      resume_id: '',
      notes: '',
    },
    validate: {
      company: (v) => (v.trim() ? null : 'Informe a empresa.'),
      position: (v) => (v.trim() ? null : 'Informe o cargo.'),
    },
  });

  const resumes = resumesQuery.data ?? [];
  const selectData = resumes.map((r) => ({
    value: r.id,
    label: resumeLabel(r),
  }));

  async function handleSubmit(values: FormValues) {
    let resume_version_id: string | null = null;
    if (values.resume_id) {
      setResolving(true);
      try {
        const latest = await getResumeLatestVersion(values.resume_id);
        resume_version_id = latest?.id ?? null;
      } finally {
        setResolving(false);
      }
    }

    await onSubmit({
      company: values.company.trim(),
      position: values.position.trim(),
      link: values.link.trim(),
      notes: values.notes.trim(),
      applied_at: values.applied_at || null,
      resume_version_id,
    });
    form.reset();
  }

  function handleClose() {
    form.reset();
    onClose();
  }

  const busy = submitting || resolving;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Nova candidatura"
      size={560}
      radius="lg"
      centered
      styles={{ title: { fontWeight: 800, fontSize: 18 } }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
            <TextInput
              label="Empresa"
              placeholder="Nubank"
              withAsterisk
              {...form.getInputProps('company')}
            />
            <TextInput
              label="Cargo"
              placeholder="Backend Sênior"
              withAsterisk
              {...form.getInputProps('position')}
            />
          </SimpleGrid>

          <TextInput
            label="Link da vaga"
            description="Opcional"
            placeholder="https://…"
            {...form.getInputProps('link')}
          />

          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
            <DatePickerInput
              label="Data da aplicação"
              placeholder="Selecione a data"
              valueFormat="DD/MM/YYYY"
              clearable
              leftSection={<Calendar size={16} />}
              leftSectionPointerEvents="none"
              popoverProps={{ withinPortal: true }}
              {...form.getInputProps('applied_at')}
            />
            <Select
              label="Currículo usado"
              placeholder={
                resumes.length ? 'Escolha um currículo' : 'Nenhum currículo'
              }
              data={selectData}
              disabled={!resumes.length}
              clearable
              checkIconPosition="right"
              {...form.getInputProps('resume_id')}
            />
          </SimpleGrid>

          <Textarea
            label="Notas"
            description="Opcional"
            placeholder="Recrutadora: Ana · indicação do João…"
            autosize
            minRows={3}
            maxRows={6}
            {...form.getInputProps('notes')}
          />

          <Group justify="space-between" gap="sm" mt="xs" wrap="nowrap">
            {!form.values.company && !form.values.position ? (
              <Anchor
                component="button"
                type="button"
                fz={12.5}
                fw={700}
                c="terracotta.7"
                onClick={() =>
                  form.setValues({
                    company: SAMPLE.company,
                    position: SAMPLE.position,
                    link: SAMPLE.link,
                    notes: SAMPLE.notes,
                    applied_at: todayISO(),
                  })
                }
              >
                Usar exemplo
              </Anchor>
            ) : (
              <span />
            )}
            <Group gap="sm" wrap="nowrap">
              <Button variant="default" onClick={handleClose} disabled={busy}>
                Cancelar
              </Button>
              <Button
                type="submit"
                color="terracotta"
                leftSection={<Plus size={16} />}
                loading={busy}
              >
                Adicionar
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
