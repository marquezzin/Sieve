import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ingestJob, type IngestJobInput } from '../api/jobs';
import type { JobPosting } from '../types';
import { JOBS_KEY } from './queryKeys';

/** Ingere a vaga (keywords + embedding no backend) e invalida a lista. */
export function useIngestJob() {
  const queryClient = useQueryClient();

  return useMutation<JobPosting, Error, IngestJobInput>({
    mutationFn: ingestJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
    },
  });
}
