import { Box, Group, Paper, Stack, Text } from '@mantine/core';
import { formatTime } from '@/lib/formatters';
import { InterviewerAvatar } from '../InterviewerAvatar/InterviewerAvatar';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const time = formatTime(message.created_at);

  if (message.role === 'user') {
    return (
      <Group justify="flex-end" gap={0}>
        <Stack gap={4} align="flex-end" maw="78%">
          <Paper
            radius="lg"
            px="md"
            py="sm"
            bg="terracotta.6"
            style={{ borderTopRightRadius: 6 }}
          >
            <Text c="white" size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
              {message.text}
            </Text>
          </Paper>
          <Text c="dimmed" size="xs" pr={4}>
            {time}
          </Text>
        </Stack>
      </Group>
    );
  }

  return (
    <Group align="flex-start" gap="sm" wrap="nowrap">
      <InterviewerAvatar size={36} />
      <Stack gap={4} maw="78%">
        <Paper
          radius="lg"
          px="md"
          py="sm"
          withBorder
          style={{ borderTopLeftRadius: 6 }}
        >
          <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
            {message.text}
          </Text>
        </Paper>
        <Box>
          <Text c="dimmed" size="xs" pl={4}>
            {time}
          </Text>
        </Box>
      </Stack>
    </Group>
  );
}
