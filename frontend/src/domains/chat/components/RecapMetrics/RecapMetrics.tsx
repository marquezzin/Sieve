import type { ComponentType } from 'react';
import { Group, Text } from '@mantine/core';
import type { CollectedSummary } from '../../types';
import {
  BriefcaseIcon,
  GraduationCapIcon,
  LayersIcon,
  TagIcon,
} from '../icons';
import classes from './RecapMetrics.module.css';

interface IconProps {
  size?: number;
}

interface MetricDef {
  key: keyof Pick<
    CollectedSummary,
    'experiences' | 'education' | 'projects' | 'skills'
  >;
  icon: ComponentType<IconProps>;
  singular: string;
  plural: string;
}

/** Ordem fixa das categorias, espelhando o recap (`InterviewSummary`). */
const METRICS: MetricDef[] = [
  { key: 'experiences', icon: BriefcaseIcon, singular: 'experiência', plural: 'experiências' },
  { key: 'education', icon: GraduationCapIcon, singular: 'formação', plural: 'formações' },
  { key: 'projects', icon: LayersIcon, singular: 'projeto', plural: 'projetos' },
  { key: 'skills', icon: TagIcon, singular: 'skill', plural: 'skills' },
];

interface RecapMetricsProps {
  summary: CollectedSummary;
  /** Tamanho da fonte das pills. Default 'xs'. */
  fz?: string;
}

/**
 * Pills de contagem por categoria do `collected_data` — substitui a linha
 * "1 experiência · 11 skills" por chips com ícone, mais legíveis num relance.
 * Categorias zeradas são omitidas; nada coletado → não renderiza nada (o card
 * cai no fallback textual).
 */
export function RecapMetrics({ summary, fz = 'xs' }: RecapMetricsProps) {
  const pills = METRICS.filter((m) => summary[m.key] > 0);
  if (pills.length === 0) return null;

  return (
    <Group gap={6} wrap="wrap">
      {pills.map(({ key, icon: Icon, singular, plural }) => {
        const count = summary[key];
        return (
          <span key={key} className={classes.metric}>
            <span className={classes.icon}>
              <Icon size={13} />
            </span>
            <Text span fz={fz} fw={700} className={classes.count}>
              {count}
            </Text>
            <Text span fz={fz} c="dimmed">
              {count === 1 ? singular : plural}
            </Text>
          </span>
        );
      })}
    </Group>
  );
}
