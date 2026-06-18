import { useQuery } from '@tanstack/react-query';
import { getJob } from '../api/jobs';
import type { JobPostingDetail } from '../types';
import { jobKey } from './queryKeys';

/**
 * Detalhe de uma vaga analisada (vaga + suas análises). `enabled` permite adiar o
 * fetch até a vaga estar visível (ex.: item de lista só abre sob demanda).
 */
export function useJob(id: string | null, enabled = true) {
  return useQuery<JobPostingDetail>({
    queryKey: jobKey(id ?? ''),
    queryFn: () => getJob(id as string),
    enabled: enabled && Boolean(id),
  });
}
