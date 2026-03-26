const TIMEOUT_ERROR_CODES = new Set(['ETIMEDOUT', 'ECONNABORTED']);

type ErrorWithCode = {
  code?: unknown;
};

export const isTimeoutError = (error: unknown): boolean => {
  const code = (error as ErrorWithCode)?.code;
  return typeof code === 'string' && TIMEOUT_ERROR_CODES.has(code);
};
