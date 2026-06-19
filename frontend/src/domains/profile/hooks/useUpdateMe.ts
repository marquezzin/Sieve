import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '@/lib/notifications';
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
      notifySuccess('Perfil salvo', 'Suas informações foram atualizadas.');
    },
    onError: () => {
      notifyError(
        'Falha ao salvar',
        'Não consegui salvar as alterações. Tente novamente.',
      );
    },
  });
}
