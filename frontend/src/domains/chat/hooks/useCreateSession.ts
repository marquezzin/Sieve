import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyError } from '@/lib/notifications';
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
      notifyError(
        'Falha ao iniciar',
        'Não consegui iniciar uma nova sessão. Tente novamente.',
      );
    },
  });
}
