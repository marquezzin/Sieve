import { apiClient } from '@/domains/auth/api/client';
import type { Resume, ResumeDetail, ResumeVersion, VersionDiff } from '../types';

/** Lista todos os currículos do usuário. */
export async function listResumes(): Promise<Resume[]> {
  const { data } = await apiClient.get<Resume[]>('/v1/resumes/');
  return data;
}

/** Detalhe de um currículo — inclui `latest_version` + `versions`. */
export async function getResume(id: string): Promise<ResumeDetail> {
  const { data } = await apiClient.get<ResumeDetail>(`/v1/resumes/${id}/`);
  return data;
}

/** Uma versão completa do currículo. */
export async function getVersion(
  id: string,
  versionNumber: number,
): Promise<ResumeVersion> {
  const { data } = await apiClient.get<ResumeVersion>(
    `/v1/resumes/${id}/versions/${versionNumber}/`,
  );
  return data;
}

/** Diff entre duas versões de um currículo. */
export async function getDiff(
  id: string,
  from: number,
  to: number,
): Promise<VersionDiff> {
  const { data } = await apiClient.get<VersionDiff>(
    `/v1/resumes/${id}/versions/${from}/diff/${to}/`,
  );
  return data;
}
