import { useQuery } from '@tanstack/react-query';
import { listApplications } from '../api/applications';
import type { Application } from '../types';
import { APPLICATIONS_KEY } from './queryKeys';

/** Cards de candidatura do usuário (o board inteiro vem numa lista). */
export function useApplications() {
  return useQuery<Application[]>({
    queryKey: APPLICATIONS_KEY,
    queryFn: listApplications,
  });
}
