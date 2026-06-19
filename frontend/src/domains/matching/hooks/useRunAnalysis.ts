import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyError } from '@/lib/notifications';
import { ingestJob } from '../api/jobs';
import { analyze } from '../api/analysis';
import { getResumeLatestVersion } from '../api/resumes';
import type { JobPosting, MatchAnalysis } from '../types';
import { JOBS_KEY } from './queryKeys';

export interface RunAnalysisVars {
  title: string;
  company: string;
  description: string;
  /** Currículo escolhido — usamos sua última versão pra comparar. */
  resume_id: string;
}

export interface RunAnalysisResult {
  job: JobPosting;
  analysis: MatchAnalysis;
  /** `id` da versão do currículo usada na análise. */
  resume_version_id: string;
}

/**
 * Orquestra o fluxo de análise num único mutation: ingere a vaga, resolve a
 * última versão do currículo escolhido (a lista não expõe o id da versão, então
 * vem do detalhe) e calcula a aderência. Mantém o page livre de `useQuery` e da
 * sequência de chamadas crus.
 */
export function useRunAnalysis() {
  const queryClient = useQueryClient();

  return useMutation<RunAnalysisResult, Error, RunAnalysisVars>({
    mutationFn: async ({ title, company, description, resume_id }) => {
      const latest = await getResumeLatestVersion(resume_id);
      if (!latest) {
        throw new Error(
          'O currículo escolhido ainda não tem uma versão pronta para comparar.',
        );
      }
      const job = await ingestJob({ title, company, description });
      const analysis = await analyze({
        resume_version_id: latest.id,
        job_posting_id: job.id,
      });
      return { job, analysis, resume_version_id: latest.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEY });
    },
    onError: (error) => {
      // Além do Alert inline na coluna de saída, notifica de forma consistente
      // com as demais mutations do app.
      notifyError('Falha na análise', error.message);
    },
  });
}
