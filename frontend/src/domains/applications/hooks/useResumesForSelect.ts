import { useQuery } from '@tanstack/react-query';
import { listResumesForSelect, type ResumeOption } from '../api/resumes';

/** Currículos do usuário pro seletor do modal de nova candidatura. */
export function useResumesForSelect() {
  return useQuery<ResumeOption[]>({
    queryKey: ['applications', 'resume-select'],
    queryFn: listResumesForSelect,
  });
}
