import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { deleteApplication } from '../api/applications';
import { APPLICATIONS_KEY } from './queryKeys';

/** Remove um card; invalida a lista e notifica. */
export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY });
      notifications.show({
        color: 'gray',
        title: 'Candidatura removida',
        message: 'O card saiu do seu funil.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Falha ao remover',
        message: 'Não consegui remover o card. Tente novamente.',
      });
    },
  });
}
