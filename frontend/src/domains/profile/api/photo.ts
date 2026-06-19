import { apiClient } from '@/domains/auth/api/client';
import type { PhotoState } from '../types';

/**
 * Sobe a selfie base (multipart/form-data, campo `photo`). Retorna o novo
 * `PhotoState`.
 *
 * É OBRIGATÓRIO sobrescrever o `Content-Type` aqui. O `apiClient` tem
 * `Content-Type: application/json` como default da instância; o `transformRequest`
 * do axios, ao ver um `FormData` com content-type JSON, serializa o FormData pra
 * JSON (`JSON.stringify(formDataToJSON(...))`) — o arquivo se perde e o DRF
 * recebe `request.FILES` vazio. Setando `multipart/form-data`, o axios mantém o
 * FormData e o browser injeta o boundary correto.
 */
export async function uploadBasePhoto(file: File): Promise<PhotoState> {
  const fd = new FormData();
  fd.append('photo', file);
  const { data } = await apiClient.post<PhotoState>('/v1/accounts/me/photo/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * Dispara a geração assíncrona (Celery) da foto profissional. Sem body.
 * Retorna o `PhotoState` já em `generating`.
 */
export async function generatePhoto(): Promise<PhotoState> {
  const { data } = await apiClient.post<PhotoState>(
    '/v1/accounts/me/photo/generate/',
  );
  return data;
}

/** Estado atual da foto — alvo do polling enquanto `generating`. */
export async function getPhotoStatus(): Promise<PhotoState> {
  const { data } = await apiClient.get<PhotoState>(
    '/v1/accounts/me/photo/status/',
  );
  return data;
}
