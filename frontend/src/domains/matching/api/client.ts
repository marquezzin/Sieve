/**
 * Re-export do `apiClient` único (mora em `domains/auth`). Centraliza o acesso
 * ao HTTP client neste domain sem duplicar axios — toda call do matching passa
 * por aqui.
 */
export { apiClient } from '@/domains/auth/api/client';
