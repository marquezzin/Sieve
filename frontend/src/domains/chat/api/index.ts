import { apiClient } from '@/domains/auth/api/client';
import type { PaginatedResponse } from '@/lib/types';
import type { Message, Session } from '../types';

/** Cria uma nova sessão. Resposta já vem com a 1ª mensagem do assistant. */
export async function createSession(): Promise<Session> {
  const { data } = await apiClient.post<Session>('/v1/chat/sessions/');
  return data;
}

/** Detalhe de uma sessão — inclui `messages`. */
export async function getSession(id: string): Promise<Session> {
  const { data } = await apiClient.get<Session>(`/v1/chat/sessions/${id}/`);
  return data;
}

/** Lista de sessões. Endpoint retorna ARRAY direto (não paginado). */
export async function listSessions(): Promise<Session[]> {
  const { data } = await apiClient.get<Session[]>('/v1/chat/sessions/');
  return data;
}

/** Envia mensagem do usuário; retorna a mensagem do assistant. */
export async function sendMessage(id: string, text: string): Promise<Message> {
  const { data } = await apiClient.post<Message>(
    `/v1/chat/sessions/${id}/messages/`,
    { text },
  );
  return data;
}

/** Finaliza a sessão (dispara geração na Fase 2). */
export async function finalizeSession(id: string): Promise<Session> {
  const { data } = await apiClient.post<Session>(
    `/v1/chat/sessions/${id}/finalize/`,
  );
  return data;
}

/** Lista de mensagens (PAGINADO). Opcional — `getSession` já traz `messages`. */
export async function listMessages(id: string): Promise<Message[]> {
  const { data } = await apiClient.get<PaginatedResponse<Message>>(
    `/v1/chat/sessions/${id}/messages/`,
  );
  return data.results;
}
