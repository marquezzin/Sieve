import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyError } from '@/lib/notifications';
import { generatePhoto } from '../api/photo';
import type { PhotoState } from '../types';
import { PROFILE_PHOTO_KEY } from './queryKeys';

/**
 * Dispara a geração da foto profissional. No sucesso o status passa a
 * `generating` e o `usePhotoStatus` assume o polling até virar `ready`. NÃO há
 * toast de sucesso aqui — o sucesso real é a foto ficar pronta.
 */
export function useGeneratePhoto() {
  const queryClient = useQueryClient();

  return useMutation<PhotoState, Error, void>({
    mutationFn: generatePhoto,
    onSuccess: (state) => {
      queryClient.setQueryData(PROFILE_PHOTO_KEY, state);
      queryClient.invalidateQueries({ queryKey: PROFILE_PHOTO_KEY });
    },
    onError: () => {
      notifyError(
        'Falha ao gerar',
        'Não consegui iniciar a geração. Tente novamente.',
      );
    },
  });
}
