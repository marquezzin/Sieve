import { useState, type KeyboardEvent } from 'react';
import { ActionIcon, Stack, Text, Textarea } from '@mantine/core';
import classes from './ChatComposer.module.css';

interface ChatComposerProps {
  disabled?: boolean;
  onSend: (text: string) => void;
}

function SendIcon() {
  return (
    <svg
      width={19}
      height={19}
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
    <Stack gap={8}>
      <div className={`${classes.card} ${disabled ? classes.cardDisabled : ''}`}>
        <Textarea
          flex={1}
          autosize
          minRows={1}
          maxRows={6}
          variant="unstyled"
          disabled={disabled}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled ? 'O entrevistador está respondendo…' : 'Escreva sua resposta…'
          }
          classNames={{ input: classes.input }}
          styles={{ input: { paddingInline: 8, fontSize: 14.5, lineHeight: 1.6 } }}
        />
        <ActionIcon
          size={40}
          radius="md"
          variant="transparent"
          disabled={!canSend}
          onClick={send}
          aria-label="Enviar mensagem"
          className={canSend ? classes.sendButton : classes.sendButtonDisabled}
        >
          <SendIcon />
        </ActionIcon>
      </div>
      <Text c="dimmed" size="xs" ta="center">
        Enter envia · Shift+Enter quebra linha — o Sieve organiza o resto.
      </Text>
    </Stack>
  );
}
