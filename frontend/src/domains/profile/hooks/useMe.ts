import { useQuery } from '@tanstack/react-query';
import { getMe } from '../api';
import type { CandidateProfile } from '../types';
import { PROFILE_ME_KEY } from './queryKeys';

export function useMe() {
  return useQuery<CandidateProfile>({
    queryKey: PROFILE_ME_KEY,
    queryFn: getMe,
  });
}
