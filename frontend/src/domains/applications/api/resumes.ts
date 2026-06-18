/**
 * Acesso LOCAL ao endpoint de currículos (`/api/v1/resumes/`) — só o suficiente
 * pro usuário marcar COM QUAL currículo (e sua última versão) se candidatou. Vive
 * DENTRO do domain applications de propósito: importar de `domains/resume` seria
 * cross-domain (proibido). Mesmo padrão de `domains/matching/api/resumes.ts`.
 */
import { apiClient } from './client';

/** Item de seleção: o currículo do usuário (shape mínimo p/ o seletor). */
export interface ResumeOption {
  id: string;
  title: string;
  target_role: string;
  status: string;
  latest_version_number: number | null;
  created_at: string;
}

/** Shape parcial do detalhe — só o que precisamos pra extrair a versão. */
interface ResumeDetailLite {
  id: string;
  latest_version: { id: string; version_number: number } | null;
}

/** Lista os currículos do usuário pro seletor (mais recentes primeiro). */
export async function listResumesForSelect(): Promise<ResumeOption[]> {
  const { data } = await apiClient.get<ResumeOption[]>('/v1/resumes/');
  return data;
}

/** Versão mais recente de um currículo (`id` + número), ou `null` se não há. */
export async function getResumeLatestVersion(
  resumeId: string,
): Promise<{ id: string; version_number: number } | null> {
  const { data } = await apiClient.get<ResumeDetailLite>(
    `/v1/resumes/${resumeId}/`,
  );
  return data.latest_version;
}
