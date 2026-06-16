/* ────────────────────────────────────────────────────────────────────────
 * Tipos do domain `resume` — espelham o contrato DRF de `/api/v1/resumes/`.
 * Campos em snake_case (espelha o backend). DecimalField vem como STRING
 * (`overall: "8.44"`) — use `parseScore` para converter com segurança.
 * ──────────────────────────────────────────────────────────────────────── */

export type ResumeStatus =
  | 'generating'
  | 'writer_done'
  | 'reviewer_done'
  | 'ready'
  | 'failed';

export type GeneratedByAgent = 'writer' | 'reviewer';

export type FeedbackTone = 'green' | 'yellow' | 'red';

/** Critérios do score do agente Juiz — todos numéricos (0–10). */
export interface ScoreCriteria {
  action_verbs: number;
  metrics: number;
  cliches: number;
  specificity: number;
  conciseness: number;
  formatting: number;
}

export interface FeedbackItem {
  tone: FeedbackTone;
  text: string;
}

export interface ResumeScore {
  /** STRING no backend (DecimalField). Parseie com `parseScore`. */
  overall: string;
  criteria: ScoreCriteria;
  feedback: FeedbackItem[];
}

/* ── Dados estruturados do currículo ── */

export interface ResumePersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
}

export interface ResumeExperience {
  id: string;
  role: string;
  company: string;
  start?: string;
  end?: string;
  location?: string;
  bullets: string[];
  tech_stack?: string[];
}

export interface ResumeEducation {
  id: string;
  course: string;
  institution: string;
  start?: string;
  end?: string;
  status?: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  description?: string;
  bullets?: string[];
  tech_stack?: string[];
}

export interface StructuredData {
  personal_info: ResumePersonalInfo;
  summary: string;
  experiences: ResumeExperience[];
  education?: ResumeEducation[];
  projects?: ResumeProject[];
  skills: string[];
}

/* ── Versões ── */

export interface ResumeVersion {
  id: string;
  version_number: number;
  generated_by_agent: GeneratedByAgent;
  structured_data: StructuredData;
  html_rendered: string;
  score: ResumeScore | null;
  created_at: string;
}

export interface ResumeVersionSummary {
  id: string;
  version_number: number;
  generated_by_agent: GeneratedByAgent;
  /** STRING no backend (DecimalField). */
  overall: string | null;
  created_at: string;
}

/* ── Currículos ── */

export interface Resume {
  id: string;
  title: string;
  target_role: string;
  status: ResumeStatus;
  latest_version_number: number | null;
  /** STRING no backend (DecimalField). */
  latest_score: string | null;
  versions_count: number;
  created_at: string;
  updated_at: string;
}

export interface ResumeDetail extends Resume {
  latest_version: ResumeVersion | null;
  versions: ResumeVersionSummary[];
}

/* ── Diff ── */

export type ChangeType = 'add' | 'rem' | 'mod';

export interface Change {
  type: ChangeType;
  section: string;
  before: string | null;
  after: string | null;
}

export interface VersionDiff {
  from: number;
  to: number;
  changes: Change[];
}

/* ── Helpers ── */

/** Converte score string→number com narrow seguro; `null` se ausente/inválido. */
export function parseScore(value: string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Tom de cor por faixa de nota (verde ≥ 7.5, amarelo ≥ 5, vermelho abaixo). */
export function scoreTone(score: number): FeedbackTone {
  if (score >= 7.5) return 'green';
  if (score >= 5) return 'yellow';
  return 'red';
}

/** Mapeia o tom para a cor Mantine correspondente. */
export const TONE_COLOR: Record<FeedbackTone, string> = {
  green: 'green',
  yellow: 'yellow',
  red: 'red',
};

/** O currículo ainda está sendo gerado (pipeline em andamento). */
export function isGenerating(status: ResumeStatus | undefined): boolean {
  return (
    status === 'generating' ||
    status === 'writer_done' ||
    status === 'reviewer_done'
  );
}

/** Rótulos pt-BR dos 6 critérios do breakdown, na ordem de exibição. */
export const CRITERIA_LABELS: { key: keyof ScoreCriteria; label: string }[] = [
  { key: 'action_verbs', label: 'Verbos de ação' },
  { key: 'metrics', label: 'Métricas e resultados' },
  { key: 'cliches', label: 'Ausência de clichês' },
  { key: 'specificity', label: 'Especificidade' },
  { key: 'conciseness', label: 'Concisão' },
  { key: 'formatting', label: 'Formatação ATS' },
];

/** Rótulo do agente que gerou a versão. */
export const AGENT_LABELS: Record<GeneratedByAgent, string> = {
  writer: 'Agente Redator',
  reviewer: 'Agente Revisor',
};
