import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { updateMe } from '../api';
import type { CandidateProfile, CandidateProfileUpdate } from '../types';
import { PROFILE_ME_KEY } from './queryKeys';

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation<CandidateProfile, Error, Partial<CandidateProfileUpdate>>({
    mutationFn: updateMe,
    onSuccess: (profile) => {
      queryClient.setQueryData(PROFILE_ME_KEY, profile);
      queryClient.invalidateQueries({ queryKey: PROFILE_ME_KEY });
      notifications.show({
        color: 'green',
        title: 'Perfil salvo',
        message: 'Suas informações foram atualizadas.',
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Falha ao salvar',
        message: 'Não consegui salvar as alterações. Tente novamente.',
      });
    },
  });
}
