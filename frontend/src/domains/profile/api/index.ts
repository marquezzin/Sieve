import { apiClient } from '@/domains/auth/api/client';
import type { CandidateProfile, CandidateProfileUpdate } from '../types';

/** Perfil do usuário autenticado. O `apiClient` já desembrulha o envelope. */
export async function getMe(): Promise<CandidateProfile> {
  const { data } = await apiClient.get<CandidateProfile>('/v1/accounts/me/');
  return data;
}

/** Atualiza os campos editáveis do perfil. Retorna o perfil atualizado. */
export async function updateMe(
  payload: Partial<CandidateProfileUpdate>,
): Promise<CandidateProfile> {
  const { data } = await apiClient.patch<CandidateProfile>(
    '/v1/accounts/me/',
    payload,
  );
  return data;
}
