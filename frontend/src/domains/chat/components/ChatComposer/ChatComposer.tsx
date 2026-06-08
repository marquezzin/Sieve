import { useState, type KeyboardEvent } from 'react';
import { ActionIcon, Group, Stack, Text, Textarea } from '@mantine/core';

interface ChatComposerProps {
  disabled?: boolean;
  onSend: (text: string) => void;
}

function SendIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

export function ChatComposer({ disabled = false, onSend }: ChatComposerProps) {
  const [value, setValue] = useState('');

  const send = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <Stack gap={6}>
      <Group align="flex-end" gap="xs" wrap="nowrap">
        <Textarea
          flex={1}
          autosize
          minRows={1}
          maxRows={6}
          radius="lg"
          disabled={disabled}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled ? 'O entrevistador está respondendo…' : 'Escreva sua resposta…'
          }
        />
        <ActionIcon
          size={42}
          radius="lg"
          color="terracotta"
          disabled={!canSend}
          onClick={send}
          aria-label="Enviar mensagem"
        >
          <SendIcon />
        </ActionIcon>
      </Group>
      <Text c="dimmed" size="xs" ta="center">
        Enter envia · Shift+Enter quebra linha — o Sieve organiza o resto.
      </Text>
    </Stack>
  );
}
