import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '@/lib/notifications';
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
      notifySuccess(
        'Candidatura criada',
        `${app.position} · ${app.company} adicionada em Aplicada.`,
      );
    },
    onError: () => {
      notifyError(
        'Falha ao criar candidatura',
        'Não consegui salvar. Confira os campos e tente novamente.',
      );
    },
  });
}
