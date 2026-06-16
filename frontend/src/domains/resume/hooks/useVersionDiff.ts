import { useQuery } from '@tanstack/react-query';
import { getDiff } from '../api/resumes';
import type { VersionDiff } from '../types';
import { versionDiffKey } from './queryKeys';

export function useVersionDiff(
  id: string | null,
  from: number | null,
  to: number | null,
) {
  const enabled = Boolean(id) && from !== null && to !== null;
  return useQuery<VersionDiff>({
    queryKey: versionDiffKey(id ?? '', from ?? 0, to ?? 0),
    queryFn: () => getDiff(id as string, from as number, to as number),
    enabled,
  });
}
