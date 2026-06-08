import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { createSession } from '../api';
import type { Session } from '../types';
import { CHAT_SESSIONS_KEY, chatSessionKey } from './queryKeys';

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation<Session, Error, void>({
    mutationFn: () => createSession(),
    onSuccess: (session) => {
      // Semeia a cache da sessão recém-criada pra abrir sem refetch.
      queryClient.setQueryData(chatSessionKey(session.id), session);
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Falha ao iniciar',
        message: 'Não consegui iniciar uma nova sessão. Tente novamente.',
      });
    },
  });
}
