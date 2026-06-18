import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { moveApplication } from '../api/applications';
import type { Application, ApplicationStatus } from '../types';
import { APPLICATIONS_KEY } from './queryKeys';

interface MoveVars {
  id: string;
  status: ApplicationStatus;
}

interface MoveContext {
  previous?: Application[];
}

/**
 * Move um card de coluna com **optimistic update**: a UI muda na hora; se a
 * persistência falhar, reverte o cache e avisa. Mantém o drag fluido.
 */
export function useMoveApplication() {
  const queryClient = useQueryClient();

  return useMutation<Application, Error, MoveVars, MoveContext>({
    mutationFn: ({ id, status }) => moveApplication(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: APPLICATIONS_KEY });
      const previous =
        queryClient.getQueryData<Application[]>(APPLICATIONS_KEY);
      queryClient.setQueryData<Application[]>(APPLICATIONS_KEY, (old) =>
        (old ?? []).map((a) => (a.id === id ? { ...a, status } : a)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(APPLICATIONS_KEY, context.previous);
      }
      notifications.show({
        color: 'red',
        title: 'Não consegui mover',
        message: 'A candidatura voltou para a coluna anterior. Tente de novo.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY });
    },
  });
}
