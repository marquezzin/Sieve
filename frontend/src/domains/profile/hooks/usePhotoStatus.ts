import { useQuery } from '@tanstack/react-query';
import { getPhotoStatus } from '../api/photo';
import { isGeneratingPhoto, type PhotoState } from '../types';
import { PROFILE_PHOTO_KEY } from './queryKeys';

/** Intervalo de polling enquanto a foto está sendo gerada (ms). */
const POLL_INTERVAL = 2500;

/**
 * Estado da foto profissional. Enquanto `photo_status === 'generating'`, faz
 * polling a cada 2.5s; para assim que vira `ready` / `failed` / `idle`. NUNCA
 * expira por conta própria — a geração roda server-side e pode demorar (cold
 * start da API externa). Mesmo padrão de polling do `useResume`.
 */
export function usePhotoStatus() {
  return useQuery<PhotoState>({
    queryKey: PROFILE_PHOTO_KEY,
    queryFn: getPhotoStatus,
    refetchInterval: (query) =>
      isGeneratingPhoto(query.state.data?.photo_status) ? POLL_INTERVAL : false,
  });
}
