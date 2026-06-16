import { Box, Group, Progress, Text } from '@mantine/core';
import {
  CRITERIA_LABELS,
  scoreTone,
  TONE_COLOR,
  type ScoreCriteria,
} from '../../types';

interface ScoreBreakdownProps {
  criteria: ScoreCriteria;
}

/**
 * Os 6 critérios do score em barras de progresso (porte do breakdown do
 * protótipo). Cor da barra por faixa: verde ≥ 7.5, amarelo ≥ 5, vermelho.
 */
export function ScoreBreakdown({ criteria }: ScoreBreakdownProps) {
  return (
    <Box>
      {CRITERIA_LABELS.map(({ key, label }) => {
        const value = criteria[key];
        const color = TONE_COLOR[scoreTone(value)];
        return (
          <Group key={key} gap="sm" wrap="nowrap" mb={10}>
            <Text fz={12.5} c="dimmed" w={120} style={{ flexShrink: 0 }}>
              {label}
            </Text>
            <Progress
              value={value * 10}
              color={color}
              radius="xl"
              size="sm"
              style={{ flex: 1 }}
            />
            <Text
              ff="monospace"
              fz={12}
              fw={600}
              w={28}
              ta="right"
              c="var(--mantine-color-text)"
            >
              {value.toFixed(1)}
            </Text>
          </Group>
        );
      })}
    </Box>
  );
}
