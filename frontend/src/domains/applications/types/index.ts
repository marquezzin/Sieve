/* ────────────────────────────────────────────────────────────────────────
 * Tipos do domain `applications` — espelham o contrato DRF de
 * `/api/v1/applications/`. Campos em snake_case (espelha o backend).
 * ──────────────────────────────────────────────────────────────────────── */

/** Os 6 estágios do funil (espelha `Application.Status` no backend). */
export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'technical_interview'
  | 'final_interview'
  | 'offer'
  | 'rejected';

/** Um card do Kanban. FKs (vaga/versão) vêm só pelo id e são nullable. */
export interface Application {
  id: string;
  company: string;
  position: string;
  link: string;
  notes: string;
  applied_at: string | null;
  status: ApplicationStatus;
  job_posting: string | null;
  resume_version: string | null;
  created_at: string;
  updated_at: string;
}

/** Body de criação de candidatura. `company`/`position` obrigatórios. */
export interface CreateApplicationInput {
  company: string;
  position: string;
  link?: string;
  notes?: string;
  applied_at?: string | null;
  job_posting_id?: string | null;
  resume_version_id?: string | null;
}

/** Definição de uma coluna do board: estágio + rótulo + cor de acento. */
export interface KanbanColumnDef {
  status: ApplicationStatus;
  label: string;
  /** Cor de acento da coluna (hex; espelha o protótipo, paleta quente da IDV). */
  tone: string;
}

/**
 * As 6 colunas, na ordem do funil. Cores portadas do protótipo (`kanban.jsx`),
 * com terracota da IDV na etapa técnica.
 */
export const KANBAN_COLUMNS: KanbanColumnDef[] = [
  { status: 'applied', label: 'Aplicada', tone: '#7d7464' },
  { status: 'screening', label: 'Triagem', tone: '#5c7cfa' },
  { status: 'technical_interview', label: 'Entrevista técnica', tone: '#cf5530' },
  { status: 'final_interview', label: 'Entrevista final', tone: '#9b59b6' },
  { status: 'offer', label: 'Oferta', tone: '#37b24d' },
  { status: 'rejected', label: 'Recusada', tone: '#fa5252' },
];
