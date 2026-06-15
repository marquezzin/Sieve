import { useState } from 'react';
import {
  Anchor,
  Badge,
  Box,
  Collapse,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import type { ComponentType, ReactNode } from 'react';
import {
  EDUCATION_STATUS_LABELS,
  parseEducation,
  parseExperiences,
  parsePersonalInfo,
  parseProjects,
  parseSkills,
  summarizeCollectedData,
} from '../../types';
import type {
  EducationItem,
  ExperienceItem,
  PersonalInfo,
  ProjectItem,
} from '../../types';
import {
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  GithubIcon,
  GraduationCapIcon,
  LayersIcon,
  LinkedinIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TagIcon,
  UserIcon,
} from '../icons';
import classes from './InterviewSummary.module.css';

interface InterviewSummaryProps {
  collectedData: Record<string, unknown>;
  /** Quando true, esconde itens com contagem zero (recap de conclusão). */
  hideEmpty?: boolean;
}

interface SectionItem {
  key: string;
  icon: ComponentType<{ size?: number }>;
  label: string;
  /** Valor numérico exibido; null = item booleano (dados pessoais). */
  count: number | null;
  filled: boolean;
  /** Conteúdo read-only revelado ao expandir. */
  detail: ReactNode;
}

/** Período "start – end" / "start – atual" — null se não houver datas. */
function periodLabel(start?: string, end?: string): string | null {
  if (start && end) return `${start} – ${end}`;
  if (start) return `${start} – atual`;
  if (end) return end;
  return null;
}

function TechBadges({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <Group gap={6}>
      {items.map((tech) => (
        <Badge key={tech} variant="light" color="terracotta" radius="sm" size="sm">
          {tech}
        </Badge>
      ))}
    </Group>
  );
}

function DetailCard({ children }: { children: ReactNode }) {
  return (
    <Paper withBorder radius="md" p="md" className={classes.detailCard}>
      <Stack gap={8}>{children}</Stack>
    </Paper>
  );
}

function PersonalDetail({ info }: { info: PersonalInfo }) {
  const rows: { icon: ComponentType<{ size?: number }>; label: string; node: ReactNode }[] =
    [];

  if (info.name) {
    rows.push({ icon: UserIcon, label: 'Nome', node: info.name });
  }
  if (info.location) {
    rows.push({ icon: MapPinIcon, label: 'Localização', node: info.location });
  }
  if (info.phone) {
    rows.push({ icon: PhoneIcon, label: 'Telefone', node: info.phone });
  }
  if (info.email) {
    rows.push({
      icon: MailIcon,
      label: 'Email',
      node: <Anchor href={`mailto:${info.email}`}>{info.email}</Anchor>,
    });
  }
  if (info.linkedin_url) {
    rows.push({
      icon: LinkedinIcon,
      label: 'LinkedIn',
      node: (
        <Anchor href={info.linkedin_url} target="_blank" rel="noreferrer">
          {info.linkedin_url}
        </Anchor>
      ),
    });
  }
  if (info.github_url) {
    rows.push({
      icon: GithubIcon,
      label: 'GitHub',
      node: (
        <Anchor href={info.github_url} target="_blank" rel="noreferrer">
          {info.github_url}
        </Anchor>
      ),
    });
  }

  return (
    <DetailCard>
      {rows.map((row) => (
        <Group key={row.label} gap="sm" wrap="nowrap" align="flex-start">
          <Box c="dimmed" mt={2}>
            <row.icon size={15} />
          </Box>
          <Stack gap={0} miw={0}>
            <Text fz={11} fw={700} tt="uppercase" c="dimmed" lts="0.05em">
              {row.label}
            </Text>
            <Text fz="sm" style={{ wordBreak: 'break-word' }}>
              {row.node}
            </Text>
          </Stack>
        </Group>
      ))}
    </DetailCard>
  );
}

function ExperienceDetail({ items }: { items: ExperienceItem[] }) {
  return (
    <Stack gap="sm">
      {items.map((exp, index) => {
        const period = periodLabel(exp.start, exp.end);
        const title = [exp.role, exp.company].filter(Boolean).join(' @ ');
        return (
          <DetailCard key={`${title}-${index}`}>
            {title && (
              <Text fw={700} fz="sm" lh={1.3}>
                {title}
              </Text>
            )}
            <Group gap="md" wrap="wrap">
              {period && (
                <Group gap={5} wrap="nowrap" c="dimmed">
                  <CalendarIcon size={13} />
                  <Text fz="xs" ff="monospace">
                    {period}
                  </Text>
                </Group>
              )}
              {exp.location && (
                <Group gap={5} wrap="nowrap" c="dimmed">
                  <MapPinIcon size={13} />
                  <Text fz="xs">{exp.location}</Text>
                </Group>
              )}
            </Group>
            {exp.bullets.length > 0 && (
              <Stack gap={4}>
                {exp.bullets.map((bullet, bulletIndex) => (
                  <Group key={bulletIndex} gap="xs" wrap="nowrap" align="flex-start">
                    <Box className={classes.bulletDot} mt={7} />
                    <Text fz="sm" lh={1.45}>
                      {bullet}
                    </Text>
                  </Group>
                ))}
              </Stack>
            )}
            <TechBadges items={exp.tech_stack} />
          </DetailCard>
        );
      })}
    </Stack>
  );
}

function EducationDetail({ items }: { items: EducationItem[] }) {
  return (
    <Stack gap="sm">
      {items.map((edu, index) => {
        const period = periodLabel(edu.start, edu.end);
        const title = [edu.course, edu.institution].filter(Boolean).join(' — ');
        return (
          <DetailCard key={`${title}-${index}`}>
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              {title && (
                <Text fw={700} fz="sm" lh={1.3}>
                  {title}
                </Text>
              )}
              {edu.status && (
                <Badge
                  variant="light"
                  color={edu.status === 'done' ? 'green' : 'terracotta'}
                  radius="sm"
                  size="sm"
                >
                  {EDUCATION_STATUS_LABELS[edu.status]}
                </Badge>
              )}
            </Group>
            {period && (
              <Group gap={5} wrap="nowrap" c="dimmed">
                <CalendarIcon size={13} />
                <Text fz="xs" ff="monospace">
                  {period}
                </Text>
              </Group>
            )}
          </DetailCard>
        );
      })}
    </Stack>
  );
}

function ProjectDetail({ items }: { items: ProjectItem[] }) {
  return (
    <Stack gap="sm">
      {items.map((proj, index) => (
        <DetailCard key={`${proj.name ?? 'projeto'}-${index}`}>
          {proj.name && (
            <Text fw={700} fz="sm" lh={1.3}>
              {proj.name}
            </Text>
          )}
          {proj.description && (
            <Text fz="sm" lh={1.45}>
              {proj.description}
            </Text>
          )}
          {proj.result && (
            <Box>
              <Text fz={11} fw={700} tt="uppercase" c="dimmed" lts="0.05em">
                Resultado
              </Text>
              <Text fz="sm" lh={1.45}>
                {proj.result}
              </Text>
            </Box>
          )}
          <TechBadges items={proj.tech_stack} />
        </DetailCard>
      ))}
    </Stack>
  );
}

function SkillsDetail({ items }: { items: string[] }) {
  return (
    <DetailCard>
      <Group gap={6}>
        {items.map((skill) => (
          <Badge key={skill} variant="light" color="terracotta" radius="sm" size="sm">
            {skill}
          </Badge>
        ))}
      </Group>
    </DetailCard>
  );
}

function SectionRow({ item }: { item: SectionItem }) {
  const [open, setOpen] = useState(false);

  return (
    <Stack gap="xs">
      <UnstyledButton
        onClick={() => setOpen((v) => !v)}
        className={`${classes.chip} ${item.filled ? classes.chipFilled : classes.chipMuted}`}
        aria-expanded={open}
      >
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon
            variant="light"
            color={item.filled ? 'green' : 'gray'}
            radius="md"
            size={34}
          >
            {item.filled && item.count === null ? (
              <CheckIcon size={17} />
            ) : (
              <item.icon size={17} />
            )}
          </ThemeIcon>
          <Group gap={6} wrap="nowrap" miw={0}>
            {item.count !== null && (
              <Text fw={800} fz="lg" lh={1.1} ff="monospace">
                {item.count}
              </Text>
            )}
            <Text fz="sm" fw={600} c={item.filled ? undefined : 'dimmed'}>
              {item.label}
            </Text>
            {item.count === null && item.filled && (
              <Text c="green.7" component="span" fz="xs" fw={700}>
                ✓
              </Text>
            )}
          </Group>
          <Box
            className={`${classes.chevron} ${open ? classes.chevronOpen : ''}`}
            c="dimmed"
          >
            <ChevronRightIcon size={16} />
          </Box>
        </Group>
      </UnstyledButton>
      <Collapse expanded={open}>
        <Box pl="md" pb={4}>
          {item.detail}
        </Box>
      </Collapse>
    </Stack>
  );
}

export function InterviewSummary({
  collectedData,
  hideEmpty = false,
}: InterviewSummaryProps) {
  const summary = summarizeCollectedData(collectedData);

  const personalInfo = parsePersonalInfo(collectedData);
  const experiences = parseExperiences(collectedData);
  const education = parseEducation(collectedData);
  const projects = parseProjects(collectedData);
  const skills = parseSkills(collectedData);

  const items: SectionItem[] = [
    {
      key: 'personal',
      icon: UserIcon,
      label: 'Dados pessoais',
      count: null,
      filled: summary.hasPersonalInfo,
      detail: personalInfo ? <PersonalDetail info={personalInfo} /> : null,
    },
    {
      key: 'experiences',
      icon: BriefcaseIcon,
      label: experiences.length === 1 ? 'Experiência' : 'Experiências',
      count: experiences.length,
      filled: experiences.length > 0,
      detail: <ExperienceDetail items={experiences} />,
    },
    {
      key: 'education',
      icon: GraduationCapIcon,
      label: education.length === 1 ? 'Formação' : 'Formações',
      count: education.length,
      filled: education.length > 0,
      detail: <EducationDetail items={education} />,
    },
    {
      key: 'projects',
      icon: LayersIcon,
      label: projects.length === 1 ? 'Projeto' : 'Projetos',
      count: projects.length,
      filled: projects.length > 0,
      detail: <ProjectDetail items={projects} />,
    },
    {
      key: 'skills',
      icon: TagIcon,
      label: 'Skills',
      count: skills.length,
      filled: skills.length > 0,
      detail: <SkillsDetail items={skills} />,
    },
  ];

  const visible = hideEmpty ? items.filter((i) => i.filled) : items;

  if (visible.length === 0) {
    return (
      <Text c="dimmed" fz="sm">
        Nenhum dado foi coletado nesta entrevista.
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      {visible.map((item) => (
        <SectionRow key={item.key} item={item} />
      ))}
    </Stack>
  );
}
