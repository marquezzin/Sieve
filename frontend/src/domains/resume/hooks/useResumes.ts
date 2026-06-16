import { useQuery } from '@tanstack/react-query';
import { listResumes } from '../api/resumes';
import type { Resume } from '../types';
import { RESUMES_KEY } from './queryKeys';

export function useResumes() {
  return useQuery<Resume[]>({
    queryKey: RESUMES_KEY,
    queryFn: listResumes,
  });
}
