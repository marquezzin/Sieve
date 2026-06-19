import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { uploadBasePhoto } from '../api/photo';
import type { PhotoState } from '../types';
import { PROFILE_PHOTO_KEY } from './queryKeys';

/** Upload da selfie base. No sucesso, semeia o cache com o novo `PhotoState`. */
export function useUploadBasePhoto() {
  const queryClient = useQueryClient();

  return useMutation<PhotoState, Error, File>({
    mutationFn: uploadBasePhoto,
    onSuccess: (state) => {
      queryClient.setQueryData(PROFILE_PHOTO_KEY, state);
      notifySuccess(
        'Foto enviada',
        'Sua selfie foi enviada. Agora é só gerar a foto profissional.',
      );
    },
    onError: () => {
      notifyError('Falha ao enviar', 'Não consegui enviar a foto. Tente novamente.');
    },
  });
}
