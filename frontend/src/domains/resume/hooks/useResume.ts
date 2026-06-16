import { useQuery } from '@tanstack/react-query';
import { getResume } from '../api/resumes';
import { isGenerating, type ResumeDetail } from '../types';
import { resumeKey } from './queryKeys';

/** Intervalo de polling enquanto o pipeline está em andamento (ms). */
const POLL_INTERVAL = 2500;

/**
 * Detalhe de um currículo. Enquanto o status estiver em geração
 * (generating / writer_done / reviewer_done), faz polling a cada 2.5s; para
 * assim que vira `ready` ou `failed`.
 */
export function useResume(id: string | null) {
  return useQuery<ResumeDetail>({
    queryKey: resumeKey(id ?? ''),
    queryFn: () => getResume(id as string),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      isGenerating(query.state.data?.status) ? POLL_INTERVAL : false,
  });
}
