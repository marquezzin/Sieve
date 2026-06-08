import { useQuery } from '@tanstack/react-query';
import { getSession } from '../api';
import type { Session } from '../types';
import { chatSessionKey } from './queryKeys';

export function useSession(id: string | null) {
  return useQuery<Session>({
    queryKey: chatSessionKey(id ?? ''),
    queryFn: () => getSession(id as string),
    enabled: Boolean(id),
  });
}
