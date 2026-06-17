import { useMutation } from '@tanstack/react-query';
import { analyze, type MatchPair } from '../api/analysis';
import type { MatchAnalysis } from '../types';

/** Variáveis do analyze: o par + flag opcional de recálculo forçado. */
export interface AnalyzeVars extends MatchPair {
  refresh?: boolean;
}

/** Calcula a aderência currículo↔vaga (usa cache do backend salvo `refresh`). */
export function useAnalyze() {
  return useMutation<MatchAnalysis, Error, AnalyzeVars>({
    mutationFn: ({ refresh, ...pair }) => analyze(pair, refresh ?? false),
  });
}
