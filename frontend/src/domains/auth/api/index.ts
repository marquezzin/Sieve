import axios from 'axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants';
import { apiClient, clearTokens } from './client';
import { API_BASE_URL } from './config';
import type { AuthUser, LoginCredentials, RegisterCredentials, TokenResponse } from '../types';

/**
 * Login NÃO usa apiClient. Motivo: o interceptor de response do apiClient
 * trata 401 como "preciso fazer refresh", o que num login causaria loop —
 * 401 no login significa "credencial errada", não "token expirado".
 * Por isso disparamos axios cru direto no endpoint público.
 */
export async function login(credentials: LoginCredentials): Promise<TokenResponse> {
  const response = await axios.post<{ data?: TokenResponse } & Partial<TokenResponse>>(
    `${API_BASE_URL}/v1/token/`,
    credentials,
    { headers: { 'Content-Type': 'application/json' } },
  );

  // Backend pode embrulhar em envelope `{ data: { access, refresh } }` ou devolver flat.
  const payload = response.data;
  const tokens: TokenResponse = {
    access: payload.data?.access ?? payload.access ?? '',
    refresh: payload.data?.refresh ?? payload.refresh ?? '',
  };

  if (!tokens.access || !tokens.refresh) {
    throw new Error('Login response missing tokens');
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  return tokens;
}

interface ErrorEnvelope {
  errors?: Array<{ message?: string }>;
}

/**
 * Cadastro NÃO usa apiClient — endpoint público, mesmo motivo do login.
 * Em sucesso (201) o backend já devolve `{ access, refresh }` (mesmo shape do login).
 * Em erro (400) propaga `errors[0].message` legível vindo do backend.
 */
export async function register(credentials: RegisterCredentials): Promise<TokenResponse> {
  try {
    const response = await axios.post<{ data?: TokenResponse } & Partial<TokenResponse>>(
      `${API_BASE_URL}/v1/accounts/register/`,
      credentials,
      { headers: { 'Content-Type': 'application/json' } },
    );

    const payload = response.data;
    const tokens: TokenResponse = {
      access: payload.data?.access ?? payload.access ?? '',
      refresh: payload.data?.refresh ?? payload.refresh ?? '',
    };

    if (!tokens.access || !tokens.refresh) {
      throw new Error('Register response missing tokens');
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
    return tokens;
  } catch (err) {
    if (axios.isAxiosError<ErrorEnvelope>(err)) {
      const message = err.response?.data?.errors?.[0]?.message;
      if (message) {
        throw new Error(message, { cause: err });
      }
    }
    throw err;
  }
}

export function logout(): void {
  clearTokens();
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/v1/me/');
  return data;
}
