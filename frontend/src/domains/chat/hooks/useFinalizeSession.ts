import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { finalizeSession } from '../api';
import type { Session } from '../types';
import { CHAT_SESSIONS_KEY, chatSessionKey } from './queryKeys';

export function useFinalizeSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation<Session, Error, void>({
    mutationFn: () => finalizeSession(sessionId),
    onSuccess: (session) => {
      queryClient.setQueryData(chatSessionKey(session.id), session);
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY });
      notifications.show({
        color: 'green',
        title: 'Entrevista finalizada',
        message:
          'Dados coletados prontos pra geração do currículo (Fase 2).',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Falha ao finalizar',
        message: 'Não consegui finalizar a entrevista. Tente novamente.',
      });
    },
  });
}
