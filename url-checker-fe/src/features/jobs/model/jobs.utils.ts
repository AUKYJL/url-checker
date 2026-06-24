import type { JobDetail, JobSummary } from './jobs.types';

const createdAtFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const normalizeUrlsInput = (value: string) => {
  return value
    .split('\n')
    .map((url) => url.trim())
    .filter(Boolean);
};

export const getProcessedCount = (
  job: Pick<JobSummary | JobDetail, 'cancelled' | 'error' | 'success'>,
) => {
  return job.success + job.error + job.cancelled;
};

export const getProgressPercent = (
  job: Pick<JobSummary | JobDetail, 'cancelled' | 'error' | 'success' | 'total'>,
) => {
  if (job.total === 0) {
    return 0;
  }

  return Math.round((getProcessedCount(job) / job.total) * 100);
};

export const formatCreatedAt = (value: string) => {
  return createdAtFormatter.format(new Date(value));
};

export const formatDurationMs = (value: number | null | undefined) => {
  if (value == null) {
    return '—';
  }

  if (value < 1000) {
    return `${value} мс`;
  }

  return `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)} c`;
};

export const formatHttpStatus = (value: number | null | undefined) => {
  return value ?? '—';
};

export const getShortJobId = (jobId: string) => {
  return `${jobId.slice(0, 8)}…`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const getApiErrorMessages = (error: unknown) => {
  if (!isRecord(error)) {
    return ['Не удалось выполнить запрос.'];
  }

  if (
    Array.isArray(error.message) &&
    error.message.length > 0 &&
    error.message.every((message) => typeof message === 'string')
  ) {
    return error.message;
  }

  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    return [error.message];
  }

  if (typeof error.error === 'string' && error.error.trim().length > 0) {
    return [error.error];
  }

  if (typeof error.statusCode === 'number') {
    return [`Ошибка запроса (${error.statusCode}).`];
  }

  return ['Не удалось выполнить запрос.'];
};
