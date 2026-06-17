import { useQuery } from '@tanstack/react-query';
import { getJob } from '../api/jobs';
import type { JobPostingDetail } from '../types';
import { jobKey } from './queryKeys';

/** Detalhe de uma vaga analisada (vaga + suas análises). */
export function useJob(id: string | null) {
  return useQuery<JobPostingDetail>({
    queryKey: jobKey(id ?? ''),
    queryFn: () => getJob(id as string),
    enabled: Boolean(id),
  });
}
