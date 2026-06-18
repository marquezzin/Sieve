// Re-export do apiClient único (axios + interceptors de auth/envelope). NÃO
// duplicar axios — toda call do domain passa por aqui.
export { apiClient } from '@/domains/auth/api/client';
