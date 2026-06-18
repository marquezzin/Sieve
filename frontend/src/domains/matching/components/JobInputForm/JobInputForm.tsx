import { useForm } from '@mantine/form';
import {
  Anchor,
  Box,
  Button,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { Sparkles } from '@/components/atoms/Icon';
import type { ResumeOption } from '../../api/resumes';

const SAMPLE_TITLE = 'Desenvolvedor(a) Backend Sênior (Python)';
// Empresa diferente do empregador atual do currículo-exemplo (João, Nubank) —
// comparar contra a própria empresa enviesaria o match.
const SAMPLE_COMPANY = 'Stone';
const SAMPLE_JD = `Buscamos Pessoa Desenvolvedora Backend Sênior (Python) para o time de pagamentos.

Requisitos:
- 5+ anos com Python e frameworks web (Django ou FastAPI)
- Experiência com PostgreSQL e modelagem de dados
- Mensageria (Kafka ou RabbitMQ) e arquitetura de microsserviços
- Observabilidade (Datadog, Prometheus)
- Inglês técnico

Diferenciais: Go, Kubernetes, experiência em fintech.`;

export interface JobFormValues {
  title: string;
  company: string;
  description: string;
  resume_id: string;
}

interface JobInputFormProps {
  resumes: ResumeOption[];
  /** Currículo pré-selecionado (default = mais recente). */
  defaultResumeId: string | null;
  analyzing: boolean;
  onSubmit: (values: JobFormValues) => void;
}

/** Rótulo do currículo no seletor: título · cargo-alvo. */
function resumeLabel(r: ResumeOption): string {
  return r.target_role ? `${r.title} · ${r.target_role}` : r.title;
}

/**
 * Form de entrada da vaga (porte do `JobAnalyzer`): título, empresa, JD e o
 * seletor de currículo contra o qual comparar. Form via `@mantine/form`.
 */
export function JobInputForm({
  resumes,
  defaultResumeId,
  analyzing,
  onSubmit,
}: JobInputFormProps) {
  const form = useForm<JobFormValues>({
    initialValues: {
      title: '',
      company: '',
      description: '',
      resume_id: defaultResumeId ?? '',
    },
    validate: {
      title: (v) => (v.trim() ? null : 'Informe o título da vaga.'),
      company: (v) => (v.trim() ? null : 'Informe a empresa.'),
      description: (v) => (v.trim() ? null : 'Cole a descrição da vaga.'),
      resume_id: (v) => (v ? null : 'Escolha um currículo.'),
    },
  });

  const selectData = resumes.map((r) => ({
    value: r.id,
    label: resumeLabel(r),
  }));

  const hasResume = resumes.length > 0;

  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      pos={{ base: 'static', lg: 'sticky' }}
      top={16}
    >
      <Text fz={15} fw={700} c="var(--mantine-color-text)" mb="md">
        Descrição da vaga
      </Text>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
            <TextInput
              label="Título da vaga"
              placeholder="Backend Sênior"
              {...form.getInputProps('title')}
            />
            <TextInput
              label="Empresa"
              placeholder="Nubank"
              {...form.getInputProps('company')}
            />
          </SimpleGrid>

          <Select
            label="Comparar com o currículo"
            placeholder={
              hasResume ? 'Escolha um currículo' : 'Nenhum currículo disponível'
            }
            data={selectData}
            disabled={!hasResume}
            checkIconPosition="right"
            {...form.getInputProps('resume_id')}
          />

          <Textarea
            label="Cole a descrição completa"
            description="Quanto mais completa, melhor o matching."
            placeholder="Cole aqui o texto da vaga…"
            autosize
            minRows={6}
            maxRows={12}
            {...form.getInputProps('description')}
          />

          <Group gap="sm" align="center">
            <Button
              type="submit"
              size="md"
              color="terracotta"
              flex={1}
              loading={analyzing}
              disabled={!hasResume}
              leftSection={<Sparkles size={18} />}
            >
              {analyzing ? 'Analisando…' : 'Analisar aderência'}
            </Button>
            {!form.values.description && (
              <Anchor
                component="button"
                type="button"
                fz={12}
                fw={700}
                c="terracotta.7"
                onClick={() =>
                  form.setValues({
                    title: SAMPLE_TITLE,
                    company: SAMPLE_COMPANY,
                    description: SAMPLE_JD,
                  })
                }
              >
                Usar exemplo
              </Anchor>
            )}
          </Group>

          {!hasResume && (
            <Box>
              <Text fz={12} c="dimmed">
                Você precisa de pelo menos um currículo pronto para analisar uma
                vaga.
              </Text>
            </Box>
          )}
        </Stack>
      </form>
    </Paper>
  );
}
