export { ResumeListPage } from './pages/ResumeListPage/ResumeListPage';
export { ResumeDetailPage } from './pages/ResumeDetailPage/ResumeDetailPage';
export { VersionDiffPage } from './pages/VersionDiffPage/VersionDiffPage';

export { useResumes } from './hooks/useResumes';
export { useResume } from './hooks/useResume';
export { useVersionDiff } from './hooks/useVersionDiff';
export { useDownloadPdf } from './hooks/useDownloadPdf';

export { StatusBadge } from './components/StatusBadge/StatusBadge';
export { ScoreGauge } from './components/ScoreGauge/ScoreGauge';

export {
  parseScore,
  scoreTone,
  isGenerating,
  TONE_COLOR,
} from './types';
export type { FeedbackTone } from './types';

export type {
  Resume,
  ResumeDetail,
  ResumeStatus,
  ResumeVersion,
  ResumeVersionSummary,
  ResumeScore,
  StructuredData,
  VersionDiff,
  Change,
} from './types';
