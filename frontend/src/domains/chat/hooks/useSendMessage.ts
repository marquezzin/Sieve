import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyError } from '@/lib/notifications';
import { sendMessage } from '../api';
import type { Message, Session } from '../types';
import { chatSessionKey } from './queryKeys';

interface SendContext {
  previous: Session | undefined;
}

/**
 * Envia a resposta do usuário.
 *
 * UX:
 * - optimistic update: a mensagem do usuário entra na cache do `useSession`
 *   imediatamente, e o `current_phase` não muda até o servidor confirmar.
 * - enquanto `isPending`, a página mostra o indicador "digitando".
 * - no `onSettled` invalidamos o detalhe da sessão, porque o turn pode gerar
 *   mensagens extras no servidor (ex.: pedido de esclarecimento) e mudar a fase.
 */
export function useSendMessage(sessionId: string) {
  const queryClient = useQueryClient();
  const key = chatSessionKey(sessionId);

  return useMutation<Message, Error, string, SendContext>({
    mutationFn: (text) => sendMessage(sessionId, text),
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Session>(key);

      if (previous) {
        const optimistic: Message = {
          id: `optimistic-${Date.now()}`,
          role: 'user',
          text,
          usage: {},
          created_at: new Date().toISOString(),
        };
        queryClient.setQueryData<Session>(key, {
          ...previous,
          messages: [...previous.messages, optimistic],
        });
      }

      return { previous };
    },
    onError: (_error, _text, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
      notifyError(
        'Falha ao enviar',
        'Não consegui enviar sua mensagem. Tente novamente.',
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
