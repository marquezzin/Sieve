import { apiClient } from './client';
import type { MatchAnalysis } from '../types';

/** Par currículo↔vaga pra analisar. */
export interface MatchPair {
  resume_version_id: string;
  job_posting_id: string;
}

/**
 * Calcula (ou recupera do cache) a aderência da versão do currículo à vaga.
 * `refresh=true` força recálculo no backend (ignora o cache por par).
 */
export async function analyze(
  pair: MatchPair,
  refresh = false,
): Promise<MatchAnalysis> {
  const { data } = await apiClient.post<MatchAnalysis>(
    '/v1/matching/analyze/',
    pair,
    refresh ? { params: { refresh: true } } : undefined,
  );
  return data;
}
