/* ────────────────────────────────────────────────────────────────────────
 * Tipos do domain `matching` — espelham o contrato DRF de `/api/v1/matching/`.
 * Campos em snake_case (espelha o backend). O `score` da análise vem como
 * FLOAT 0.0–1.0 — multiplique por 100 para a porcentagem do gauge.
 * ──────────────────────────────────────────────────────────────────────── */

/** Vaga colada pelo usuário (keywords extraídas via LLM no backend). */
export interface JobPosting {
  id: string;
  title: string;
  company: string;
  description: string;
  extracted_keywords: string[];
  created_at: string;
}

/** Uma skill exigida pela vaga que falta no currículo. */
export interface MissingSkill {
  skill: string;
  critical: boolean;
}

/** Categoria de uma recomendação (honesta — nunca manda fabricar). */
export type RecommendationCategory = 'realce' | 'enfase' | 'gap' | '';

/** Recomendação detalhada: título acionável + explicação ancorada no currículo. */
export interface Recommendation {
  title: string;
  detail: string;
  category: RecommendationCategory;
}

/** Veredito de aderência de uma versão do currículo a uma vaga. */
export interface MatchAnalysis {
  id: string;
  /** Id do currículo-pai (Resume). */
  resume: string;
  resume_version: string;
  job_posting: string;
  /** FLOAT 0.0–1.0 (similaridade). Multiplique por 100 pra exibir %. */
  score: number;
  matched_skills: string[];
  missing_skills: MissingSkill[];
  recommendations: Recommendation[];
  created_at: string;
}

/** Detalhe de uma vaga: a vaga + suas análises (mais recente primeiro). */
export interface JobPostingDetail extends JobPosting {
  analyses: MatchAnalysis[];
}

/* ── Helpers ── */

export type MatchTone = 'green' | 'yellow' | 'red';

/** O score vem 0–1; o percentual inteiro pro gauge e os chips. */
export function scorePercent(score: number): number {
  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}

/** Tom de cor por faixa de aderência (verde ≥ 75%, amarelo ≥ 50%, vermelho). */
export function matchTone(percent: number): MatchTone {
  if (percent >= 75) return 'green';
  if (percent >= 50) return 'yellow';
  return 'red';
}

/** Mapeia o tom para a cor Mantine correspondente. */
export const MATCH_TONE_COLOR: Record<MatchTone, string> = {
  green: 'green',
  yellow: 'yellow',
  red: 'red',
};

/** Rótulo curto da faixa de aderência (badge do resultado). */
export function matchLabel(percent: number): string {
  if (percent >= 75) return 'Alta aderência';
  if (percent >= 50) return 'Aderência média';
  return 'Baixa aderência';
}

/** Rótulo + cor Mantine de cada categoria de recomendação (vazio = sem tag). */
export const RECOMMENDATION_META: Record<
  Exclude<RecommendationCategory, ''>,
  { label: string; color: string }
> = {
  realce: { label: 'Realce', color: 'terracotta' },
  enfase: { label: 'Ênfase', color: 'blue' },
  gap: { label: 'Gap real', color: 'yellow' },
};
