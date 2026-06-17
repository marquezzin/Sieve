export const JOBS_KEY = ['matching', 'jobs'] as const;

export const jobKey = (id: string) => ['matching', 'job', id] as const;

export const RESUME_SELECT_KEY = ['matching', 'resume-select'] as const;

export const resumeLatestVersionKey = (resumeId: string) =>
  ['matching', 'resume-latest-version', resumeId] as const;
