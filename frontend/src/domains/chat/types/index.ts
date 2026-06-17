export type SessionStatus = 'active' | 'completed';

export type Phase =
  | 'intro'
  | 'personal_info'
  | 'education'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'review'
  | 'done';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  usage: Record<string, number>;
  created_at: string;
}

export interface Session {
  id: string;
  status: SessionStatus;
  current_phase: Phase;
  collected_data: Record<string, unknown>;
  messages: Message[];
  /**
   * Currículo gerado pela finalização. Só presente no payload do `finalize`;
   * sessões concluídas vindas do histórico NÃO o trazem.
   */
  resume_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fases visíveis no stepper, na ordem do fluxo da entrevista.
 * `done` não aparece como passo — significa "todas concluídas".
 */
export const PHASE_STEPS: Phase[] = [
  'intro',
  'personal_info',
  'education',
  'experience',
  'projects',
  'skills',
  'review',
];

export const PHASE_LABELS: Record<Phase, string> = {
  intro: 'Introdução',
  personal_info: 'Dados pessoais',
  education: 'Formação',
  experience: 'Experiência',
  projects: 'Projetos',
  skills: 'Skills',
  review: 'Revisão',
  done: 'Concluída',
};

/** Índice da fase no fluxo. `done` fica após o último passo. */
export function phaseIndex(phase: Phase): number {
  if (phase === 'done') return PHASE_STEPS.length;
  return PHASE_STEPS.indexOf(phase);
}

/** Finalizar só é permitido a partir de `skills`. */
export function canFinalize(phase: Phase): boolean {
  return phaseIndex(phase) >= phaseIndex('skills');
}

/**
 * Resumo tipado do que foi coletado numa sessão. Derivado de
 * `collected_data` (shape do backend: chaves só existem quando coletadas).
 */
export interface CollectedSummary {
  hasPersonalInfo: boolean;
  experiences: number;
  education: number;
  projects: number;
  skills: number;
}

/** Conta os itens de um array dentro de `unknown` com narrow seguro. */
function countArray(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

/** Verifica se um objeto não-vazio foi coletado (ex.: `personal_info`). */
function hasObjectData(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}

/**
 * Normaliza `collected_data` num resumo de contagens, sem `any`.
 * Chaves ausentes contam como zero / false.
 */
export function summarizeCollectedData(
  data: Record<string, unknown>,
): CollectedSummary {
  return {
    hasPersonalInfo: hasObjectData(data.personal_info),
    experiences: countArray(data.experiences),
    education: countArray(data.education),
    projects: countArray(data.projects),
    skills: countArray(data.skills),
  };
}

/* ────────────────────────────────────────────────────────────────────────
 * Parsers tipados do `collected_data` (shape do backend, valores `unknown`).
 * Tudo com narrow seguro — sem `any`. Entradas malformadas/vazias são
 * descartadas; campos ausentes viram `undefined`.
 * ──────────────────────────────────────────────────────────────────────── */

/** Dados pessoais coletados — todos os campos opcionais. */
export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
}

/** Uma experiência profissional coletada. */
export interface ExperienceItem {
  company?: string;
  role?: string;
  start?: string;
  end?: string;
  location?: string;
  bullets: string[];
  tech_stack: string[];
}

export type EducationStatus = 'in_progress' | 'done';

/** Uma formação acadêmica coletada. */
export interface EducationItem {
  institution?: string;
  course?: string;
  start?: string;
  end?: string;
  status?: EducationStatus;
}

/** Um projeto coletado. */
export interface ProjectItem {
  name?: string;
  description?: string;
  result?: string;
  tech_stack: string[];
}

/** Narrow: `value` é um objeto plano (não array, não null). */
function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/** String não-vazia (trim) ou `undefined`. */
function asString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

/** Array de strings não-vazias; sempre retorna array (pode ser vazio). */
function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asString(entry))
    .filter((entry): entry is string => entry !== undefined);
}

/** Garante array de objetos a partir de `unknown`. */
function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asRecord(entry))
    .filter((entry): entry is Record<string, unknown> => entry !== null);
}

/** Dados pessoais limpos — `null` se nada foi coletado. */
export function parsePersonalInfo(
  data: Record<string, unknown>,
): PersonalInfo | null {
  const raw = asRecord(data.personal_info);
  if (!raw) return null;
  const info: PersonalInfo = {
    name: asString(raw.name),
    email: asString(raw.email),
    phone: asString(raw.phone),
    location: asString(raw.location),
    linkedin_url: asString(raw.linkedin_url),
    github_url: asString(raw.github_url),
  };
  const hasAny = Object.values(info).some((v) => v !== undefined);
  return hasAny ? info : null;
}

/** Experiências limpas — descarta entradas totalmente vazias. */
export function parseExperiences(
  data: Record<string, unknown>,
): ExperienceItem[] {
  return asRecordArray(data.experiences)
    .map<ExperienceItem>((raw) => ({
      company: asString(raw.company),
      role: asString(raw.role),
      start: asString(raw.start),
      end: asString(raw.end),
      location: asString(raw.location),
      bullets: asStringArray(raw.bullets),
      tech_stack: asStringArray(raw.tech_stack),
    }))
    .filter(
      (e) =>
        e.company !== undefined ||
        e.role !== undefined ||
        e.bullets.length > 0 ||
        e.tech_stack.length > 0,
    );
}

/** Formações limpas — descarta entradas totalmente vazias. */
export function parseEducation(data: Record<string, unknown>): EducationItem[] {
  return asRecordArray(data.education)
    .map<EducationItem>((raw) => {
      const status = asString(raw.status);
      return {
        institution: asString(raw.institution),
        course: asString(raw.course),
        start: asString(raw.start),
        end: asString(raw.end),
        status:
          status === 'in_progress' || status === 'done' ? status : undefined,
      };
    })
    .filter((e) => e.institution !== undefined || e.course !== undefined);
}

/** Projetos limpos — descarta entradas totalmente vazias. */
export function parseProjects(data: Record<string, unknown>): ProjectItem[] {
  return asRecordArray(data.projects)
    .map<ProjectItem>((raw) => ({
      name: asString(raw.name),
      description: asString(raw.description),
      result: asString(raw.result),
      tech_stack: asStringArray(raw.tech_stack),
    }))
    .filter(
      (p) =>
        p.name !== undefined ||
        p.description !== undefined ||
        p.result !== undefined ||
        p.tech_stack.length > 0,
    );
}

/** Skills limpas — array de strings não-vazias. */
export function parseSkills(data: Record<string, unknown>): string[] {
  return asStringArray(data.skills);
}

/** Rótulo pt-BR do status de uma formação. */
export const EDUCATION_STATUS_LABELS: Record<EducationStatus, string> = {
  in_progress: 'Em andamento',
  done: 'Concluída',
};

/** Linha curta de recap: "3 experiências · 2 formações · 8 skills". */
export function summaryLine(summary: CollectedSummary): string {
  const parts: string[] = [];
  if (summary.hasPersonalInfo) parts.push('dados pessoais');
  if (summary.experiences > 0) {
    parts.push(
      `${summary.experiences} ${summary.experiences === 1 ? 'experiência' : 'experiências'}`,
    );
  }
  if (summary.education > 0) {
    parts.push(
      `${summary.education} ${summary.education === 1 ? 'formação' : 'formações'}`,
    );
  }
  if (summary.projects > 0) {
    parts.push(
      `${summary.projects} ${summary.projects === 1 ? 'projeto' : 'projetos'}`,
    );
  }
  if (summary.skills > 0) parts.push(`${summary.skills} skills`);
  return parts.length > 0 ? parts.join(' · ') : 'Nenhum dado coletado ainda';
}

/**
 * Cabeçalho humano de uma entrevista: o nome do candidato + um "headline"
 * (cargo · empresa da 1ª experiência, ou curso · instituição como fallback).
 * Dá significado ao card/atividade em vez de só contagens soltas — `name` e
 * `subtitle` são `undefined` quando o dado ainda não foi coletado.
 */
export interface InterviewHeadline {
  name?: string;
  subtitle?: string;
}

export function interviewHeadline(
  data: Record<string, unknown>,
): InterviewHeadline {
  const info = parsePersonalInfo(data);
  const exp = parseExperiences(data)[0];
  const edu = parseEducation(data)[0];

  let subtitle: string | undefined;
  if (exp && (exp.role || exp.company)) {
    subtitle = [exp.role, exp.company].filter(Boolean).join(' · ');
  } else if (edu && (edu.course || edu.institution)) {
    subtitle = [edu.course, edu.institution].filter(Boolean).join(' · ');
  }

  return { name: info?.name, subtitle };
}
