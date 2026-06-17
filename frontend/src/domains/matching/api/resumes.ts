/**
 * Acesso LOCAL ao endpoint de currículos (`/api/v1/resumes/`) — só o suficiente
 * pra o usuário escolher CONTRA QUAL currículo (e sua última versão) comparar a
 * vaga. Vive DENTRO do domain matching de propósito: importar de `domains/resume`
 * seria cross-domain (proibido). Mantemos um shape mínimo próprio aqui.
 *
 * A lista (`/v1/resumes/`) expõe `latest_version_number`, mas NÃO o `id` da
 * última versão — e o `analyze` precisa do `resume_version_id`. Então o `id` da
 * versão sai do detalhe (`/v1/resumes/{id}/` → `latest_version.id`).
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
