import { useQuery } from '@tanstack/react-query';
import { listSessions } from '../api';
import type { Session } from '../types';
import { CHAT_SESSIONS_KEY } from './queryKeys';

export function useSessions() {
  return useQuery<Session[]>({
    queryKey: CHAT_SESSIONS_KEY,
    queryFn: listSessions,
  });
}
