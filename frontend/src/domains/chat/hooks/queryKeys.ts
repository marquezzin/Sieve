export const CHAT_SESSIONS_KEY = ['chat', 'sessions'] as const;

export const chatSessionKey = (id: string) =>
  ['chat', 'session', id] as const;
