import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { createApplication } from '../api/applications';
import type { Application, CreateApplicationInput } from '../types';
import { APPLICATIONS_KEY } from './queryKeys';

/** Cria um card; invalida a lista e notifica. */
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation<Application, Error, CreateApplicationInput>({
    mutationFn: createApplication,
    onSuccess: (app) => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEY });
      notifications.show({
        color: 'green',
        title: 'Candidatura criada',
        message: `${app.position} · ${app.company} adicionada em Aplicada.`,
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Falha ao criar candidatura',
        message: 'Não consegui salvar. Confira os campos e tente novamente.',
      });
    },
  });
}
