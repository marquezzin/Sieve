import { apiClient } from './client';
import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
} from '../types';

/** Lista os cards do usuário — ARRAY direto (sem paginação no backend). */
export async function listApplications(): Promise<Application[]> {
  const { data } = await apiClient.get<Application[]>('/v1/applications/');
  return data;
}

/** Cria um card (entra na coluna "applied" por default no backend). */
export async function createApplication(
  input: CreateApplicationInput,
): Promise<Application> {
  const { data } = await apiClient.post<Application>(
    '/v1/applications/',
    input,
  );
  return data;
}

/** Move o card de coluna — endpoint atômico dedicado (`PATCH /{id}/move/`). */
export async function moveApplication(
  id: string,
  status: ApplicationStatus,
): Promise<Application> {
  const { data } = await apiClient.patch<Application>(
    `/v1/applications/${id}/move/`,
    { status },
  );
  return data;
}

/** Remove um card. */
export async function deleteApplication(id: string): Promise<void> {
  await apiClient.delete(`/v1/applications/${id}/`);
}
