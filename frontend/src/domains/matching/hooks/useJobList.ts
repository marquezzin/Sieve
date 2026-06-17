import { useQuery } from '@tanstack/react-query';
import { listJobs } from '../api/jobs';
import type { JobPosting } from '../types';
import { JOBS_KEY } from './queryKeys';

/** Vagas já analisadas pelo usuário (aba "Analisadas"). */
export function useJobList() {
  return useQuery<JobPosting[]>({
    queryKey: JOBS_KEY,
    queryFn: listJobs,
  });
}
