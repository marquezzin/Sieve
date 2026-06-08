import { Group, Paper } from '@mantine/core';
import { InterviewerAvatar } from '../InterviewerAvatar/InterviewerAvatar';
import classes from './TypingIndicator.module.css';

export function TypingIndicator() {
  return (
    <Group align="flex-start" gap="sm" wrap="nowrap">
      <InterviewerAvatar size={36} />
      <Paper radius="lg" px="md" py="md" withBorder style={{ borderTopLeftRadius: 6 }}>
        <span className={classes.dots} aria-label="Entrevistador digitando">
          <span className={classes.dot} />
          <span className={classes.dot} />
          <span className={classes.dot} />
        </span>
      </Paper>
    </Group>
  );
}
