import type { ReactNode } from 'react';
import { Box, Divider, Group, Skeleton, Stack, Text } from '@mantine/core';
import type { StructuredData } from '../../types';
import classes from './ResumePreview.module.css';

interface ResumePreviewProps {
  data?: StructuredData;
  /** Quando true, mostra o esqueleto de carregamento (pipeline em andamento). */
  skeleton?: boolean;
}

function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box mt={24} pt={20}>
      <Divider mb={10} />
      <Text
        fz={11}
        fw={700}
        tt="uppercase"
        c="terracotta.6"
        mb={10}
        style={{ letterSpacing: '0.12em' }}
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

function joinPeriod(start?: string, end?: string): string {
  if (start && end) return `${start} – ${end}`;
  return start ?? end ?? '';
}

/**
 * Preview do currículo montado a partir do `structured_data` (porte fiel do
 * `A4Preview` do protótipo). Preferimos o structured_data ao `html_rendered`
 * (controle visual + fidelidade ao A4); o HTML é reservado para o PDF.
 */
export function ResumePreview({ data, skeleton }: ResumePreviewProps) {
  if (skeleton || !data) {
    return (
      <Box className={classes.doc}>
        <Box className={classes.accentBar} />
        <Box className={classes.body}>
          <Skeleton h={28} w={208} mb={8} />
          <Skeleton h={12} w={288} mb={24} />
          {[0, 1, 2].map((i) => (
            <Box key={i} mb={24}>
              <Skeleton h={14} w={128} mb={12} />
              <Skeleton h={10} mb={8} />
              <Skeleton h={10} w="92%" mb={8} />
              <Skeleton h={10} w="80%" />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  const { personal_info, summary, experiences, education, projects, skills } =
    data;
  const contacts = [
    personal_info.location,
    personal_info.email,
    personal_info.phone,
    personal_info.linkedin_url,
    personal_info.github_url,
  ].filter((c): c is string => Boolean(c));

  return (
    <Box className={classes.doc}>
      <Box className={classes.accentBar} />
      <Box className={classes.body}>
        <Text fz={24} fw={800} c="var(--mantine-color-text)" style={{ letterSpacing: '-0.02em' }}>
          {personal_info.name ?? 'Sem nome'}
        </Text>
        {contacts.length > 0 && (
          <Group gap={12} mt={8} style={{ rowGap: 4 }}>
            {contacts.map((c, i) => (
              <Group key={i} gap={6} wrap="nowrap">
                {i > 0 && (
                  <Box
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 999,
                      backgroundColor: 'var(--mantine-color-gray-4)',
                    }}
                  />
                )}
                <Text fz={12} c="dimmed">
                  {c}
                </Text>
              </Group>
            ))}
          </Group>
        )}

        {summary && (
          <DocSection title="Resumo profissional">
            <Text fz={13} lh={1.6} c="var(--mantine-color-text)">
              {summary}
            </Text>
          </DocSection>
        )}

        {experiences.length > 0 && (
          <DocSection title="Experiência">
            <Stack gap="md">
              {experiences.map((e) => (
                <Box key={e.id}>
                  <Group justify="space-between" wrap="nowrap" align="baseline">
                    <Text fz={13.5} fw={700} c="var(--mantine-color-text)">
                      {e.role} ·{' '}
                      <Text span c="terracotta.7" fw={700}>
                        {e.company}
                      </Text>
                    </Text>
                    <Text fz={11.5} c="dimmed" fw={500} style={{ flexShrink: 0 }}>
                      {joinPeriod(e.start, e.end)}
                    </Text>
                  </Group>
                  <Stack gap={4} mt={6}>
                    {e.bullets.map((b, j) => (
                      <Group key={j} gap={8} wrap="nowrap" align="flex-start">
                        <Box className={classes.bullet} />
                        <Text fz={12.5} lh={1.6} c="var(--mantine-color-text)">
                          {b}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </DocSection>
        )}

        {education && education.length > 0 && (
          <DocSection title="Formação">
            <Stack gap="xs">
              {education.map((e) => (
                <Group key={e.id} justify="space-between" wrap="nowrap" align="baseline">
                  <Text fz={13.5} fw={700} c="var(--mantine-color-text)">
                    {e.course}
                    <Text span fw={400} c="dimmed">
                      {' '}
                      — {e.institution}
                    </Text>
                  </Text>
                  <Text fz={11.5} c="dimmed" style={{ flexShrink: 0 }}>
                    {joinPeriod(e.start, e.end)}
                  </Text>
                </Group>
              ))}
            </Stack>
          </DocSection>
        )}

        {skills.length > 0 && (
          <DocSection title="Skills">
            <Group gap={6}>
              {skills.map((s) => (
                <span key={s} className={classes.skill}>
                  {s}
                </span>
              ))}
            </Group>
          </DocSection>
        )}

        {projects && projects.length > 0 && (
          <DocSection title="Projetos">
            <Stack gap="md">
              {projects.map((p) => (
                <Box key={p.id}>
                  <Text fz={13.5} fw={700} c="var(--mantine-color-text)">
                    {p.name}
                  </Text>
                  {p.description && (
                    <Text fz={12.5} lh={1.6} mt={2} c="var(--mantine-color-text)">
                      {p.description}
                    </Text>
                  )}
                  {p.bullets && p.bullets.length > 0 && (
                    <Stack gap={4} mt={6}>
                      {p.bullets.map((b, j) => (
                        <Group key={j} gap={8} wrap="nowrap" align="flex-start">
                          <Box className={classes.bullet} />
                          <Text fz={12.5} lh={1.6} c="var(--mantine-color-text)">
                            {b}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
          </DocSection>
        )}
      </Box>
    </Box>
  );
}
