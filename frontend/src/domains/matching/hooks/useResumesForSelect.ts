import { useQuery } from '@tanstack/react-query';
import { listResumesForSelect, type ResumeOption } from '../api/resumes';
import { RESUME_SELECT_KEY } from './queryKeys';

/** Currículos do usuário pro seletor do analisador (default = mais recente). */
export function useResumesForSelect() {
  return useQuery<ResumeOption[]>({
    queryKey: RESUME_SELECT_KEY,
    queryFn: listResumesForSelect,
  });
}
