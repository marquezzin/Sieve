export const RESUMES_KEY = ['resume', 'list'] as const;

export const resumeKey = (id: string) => ['resume', 'detail', id] as const;

export const versionDiffKey = (id: string, from: number, to: number) =>
  ['resume', 'diff', id, from, to] as const;
