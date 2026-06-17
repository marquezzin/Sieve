import { apiClient } from './client';
import type { JobPosting, JobPostingDetail } from '../types';

/** Body de criação de vaga. */
export interface IngestJobInput {
  title: string;
  company: string;
  description: string;
}

/** Ingere uma vaga (extrai keywords + embedding no backend) → `JobPosting`. */
export async function ingestJob(input: IngestJobInput): Promise<JobPosting> {
  const { data } = await apiClient.post<JobPosting>('/v1/matching/jobs/', input);
  return data;
}

/** Lista as vagas já analisadas pelo usuário — ARRAY direto. */
export async function listJobs(): Promise<JobPosting[]> {
  const { data } = await apiClient.get<JobPosting[]>('/v1/matching/jobs/');
  return data;
}

/** Detalhe de uma vaga — inclui as análises (`analyses`, mais recente primeiro). */
export async function getJob(id: string): Promise<JobPostingDetail> {
  const { data } = await apiClient.get<JobPostingDetail>(
    `/v1/matching/jobs/${id}/`,
  );
  return data;
}
