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
