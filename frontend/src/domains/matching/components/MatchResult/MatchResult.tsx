import type { ReactNode } from 'react';
import {
  Badge,
  Box,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { Alert as AlertIcon, Check } from '@/components/atoms/Icon';
import {
  matchLabel,
  matchTone,
  MATCH_TONE_COLOR,
  RECOMMENDATION_META,
  scorePercent,
  type MatchAnalysis,
  type Recommendation,
} from '../../types';
import { MatchScoreGauge } from '../MatchScoreGauge/MatchScoreGauge';

interface MatchResultProps {
  analysis: MatchAnalysis;
}

function SectionLabel({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <Group justify="space-between" align="center" mb="sm">
      <Text fz={15} fw={700} c="var(--mantine-color-text)">
        {children}
      </Text>
      {right}
    </Group>
  );
}

/** Chip verde de skill que bate (porte do chip green do protótipo). */
function MatchedChip({ skill }: { skill: string }) {
  return (
    <Badge
      variant="light"
      color="green"
      size="lg"
      radius="xl"
      leftSection={<Check size={13} />}
      tt="none"
      styles={{ label: { fontWeight: 600 } }}
    >
      {skill}
    </Badge>
  );
}

/** Chip de skill que falta — vermelho+alerta se crítica, neutro se não. */
function MissingChip({ skill, critical }: { skill: string; critical: boolean }) {
  return (
    <Badge
      variant="light"
      color={critical ? 'red' : 'gray'}
      size="lg"
      radius="xl"
      leftSection={critical ? <AlertIcon size={12} /> : undefined}
      tt="none"
      styles={{ label: { fontWeight: 600 } }}
    >
      {skill}
    </Badge>
  );
}

/** Recomendação detalhada: número + título acionável + explicação + tag de categoria. */
function RecommendationCard({
  rec,
  index,
}: {
  rec: Recommendation;
  index: number;
}) {
  const meta = rec.category ? RECOMMENDATION_META[rec.category] : null;
  return (
    <Paper withBorder radius="md" p="sm">
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <Box
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 22,
            height: 22,
            borderRadius: 999,
            flexShrink: 0,
            marginTop: 1,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--mantine-color-terracotta-7)',
            background:
              'light-dark(var(--mantine-color-terracotta-0), var(--mantine-color-dark-5))',
          }}
        >
          {index + 1}
        </Box>
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" align="center" justify="space-between" wrap="nowrap">
            {rec.title && (
              <Text fz={14} fw={700} c="var(--mantine-color-text)">
                {rec.title}
              </Text>
            )}
            {meta && (
              <Badge color={meta.color} variant="light" size="sm" tt="none">
                {meta.label}
              </Badge>
            )}
          </Group>
          {rec.detail && (
            <Text fz={13.5} lh={1.6} c="dimmed">
              {rec.detail}
            </Text>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}

/**
 * Painel de resultado do match (porte do `MatchResult`): gauge + veredito,
 * skills que batem / faltam e recomendações detalhadas.
 */
export function MatchResult({ analysis }: MatchResultProps) {
  const percent = scorePercent(analysis.score);
  const tone = matchTone(percent);
  const toneColor = MATCH_TONE_COLOR[tone];

  return (
    <Stack gap="md">
      {/* Gauge + veredito */}
      <Paper withBorder radius="lg" p="lg">
        <Group align="center" gap="xl" wrap="wrap" justify="center">
          <MatchScoreGauge percent={percent} size={140} />
          <Stack gap={6} style={{ flex: 1, minWidth: 220 }}>
            <Box>
              <Badge color={toneColor} variant="light" size="sm">
                {matchLabel(percent)}
              </Badge>
            </Box>
            <Text fz="xl" fw={700} c="var(--mantine-color-text)">
              {percent >= 75
                ? 'Você é um forte candidato'
                : percent >= 50
                  ? 'Candidatura possível com ajustes'
                  : 'Aderência baixa para esta vaga'}
            </Text>
            <Text c="dimmed" fz={14} lh={1.6}>
              Seu currículo cobre {analysis.matched_skills.length} requisito
              {analysis.matched_skills.length === 1 ? '' : 's'} da vaga. Cobrir as
              skills que faltam pode elevar sua aderência.
            </Text>
          </Stack>
        </Group>
      </Paper>

      {/* Skills */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Paper withBorder radius="lg" p="md">
          <SectionLabel
            right={
              <Badge color="green" variant="light">
                {analysis.matched_skills.length}
              </Badge>
            }
          >
            Skills que batem
          </SectionLabel>
          {analysis.matched_skills.length > 0 ? (
            <Group gap="xs">
              {analysis.matched_skills.map((s) => (
                <MatchedChip key={s} skill={s} />
              ))}
            </Group>
          ) : (
            <Text fz={13} c="dimmed">
              Nenhuma skill em comum identificada.
            </Text>
          )}
        </Paper>

        <Paper withBorder radius="lg" p="md">
          <SectionLabel
            right={
              <Badge color="red" variant="light">
                {analysis.missing_skills.length}
              </Badge>
            }
          >
            Skills que faltam
          </SectionLabel>
          {analysis.missing_skills.length > 0 ? (
            <Group gap="xs">
              {analysis.missing_skills.map((m) => (
                <MissingChip
                  key={m.skill}
                  skill={m.skill}
                  critical={m.critical}
                />
              ))}
            </Group>
          ) : (
            <Text fz={13} c="dimmed">
              Você cobre todas as skills exigidas.
            </Text>
          )}
        </Paper>
      </SimpleGrid>

      {/* Recomendações detalhadas */}
      {analysis.recommendations.length > 0 && (
        <Paper withBorder radius="lg" p="md">
          <SectionLabel>Recomendações</SectionLabel>
          <Stack gap="sm">
            {analysis.recommendations.map((rec, i) => (
              <RecommendationCard
                key={rec.title || rec.detail || i}
                rec={rec}
                index={i}
              />
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
