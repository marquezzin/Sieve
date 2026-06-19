/**
 * Perfil do candidato. Espelha o `CandidateProfileSerializer` do backend
 * (`/api/v1/accounts/me/`). Campos em `snake_case` como o DRF devolve.
 */
export interface CandidateProfile {
  id: string;
  /** Somente leitura — exibido no header/avatar. */
  email: string;
  /** Somente leitura — exibido no header/avatar. */
  full_name: string;
  headline: string;
  location: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
  created_at: string;
  updated_at: string;
}

/** Campos editáveis via PATCH `/v1/accounts/me/`. */
export type CandidateProfileUpdate = Pick<
  CandidateProfile,
  'headline' | 'location' | 'phone' | 'linkedin_url' | 'github_url'
>;

/** Estado da geração da foto profissional. Espelha `photo_status` do backend. */
export type PhotoStatus = 'idle' | 'generating' | 'ready' | 'failed';

/**
 * Estado da foto profissional do candidato (`/v1/accounts/me/photo/...`).
 * `apiClient` já desembrulha o envelope; URLs `/media/...` servidas pelo backend.
 */
export interface PhotoState {
  photo_status: PhotoStatus;
  /** URL da selfie base enviada pelo usuário. `null` enquanto não há upload. */
  base_photo_url: string | null;
  /** URL da foto profissional gerada. `null` enquanto não está `ready`. */
  professional_photo_url: string | null;
}

/**
 * `true` só quando a geração está em andamento — espelha o `isGenerating`
 * do domain resume. Gate do `refetchInterval` do polling.
 */
export function isGeneratingPhoto(status?: PhotoStatus): boolean {
  return status === 'generating';
}
