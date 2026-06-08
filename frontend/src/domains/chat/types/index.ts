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
