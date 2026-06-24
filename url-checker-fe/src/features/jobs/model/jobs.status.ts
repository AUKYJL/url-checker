import type { JobStatus, UrlCheckStatus } from './jobs.types';

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'В очереди',
  in_progress: 'В работе',
  completed: 'Завершена',
  cancelled: 'Отменена',
  failed: 'Ошибка',
};

export const URL_STATUS_LABELS: Record<UrlCheckStatus, string> = {
  pending: 'Ожидает',
  in_progress: 'Проверяется',
  success: 'Успех',
  error: 'Ошибка',
  cancelled: 'Отменён',
};

export const TERMINAL_JOB_STATUSES = new Set<JobStatus>([
  'completed',
  'cancelled',
  'failed',
]);

export const RUNNING_JOB_STATUSES = new Set<JobStatus>([
  'pending',
  'in_progress',
]);

export const JOB_STATUS_BADGE_CLASS_NAMES: Record<JobStatus, string> = {
  pending: 'border-border bg-muted text-muted-foreground',
  in_progress: 'border-primary/20 bg-primary/10 text-primary',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled: 'border-border bg-background text-muted-foreground',
  failed: 'border-destructive/20 bg-destructive text-white',
};

export const URL_STATUS_BADGE_CLASS_NAMES: Record<UrlCheckStatus, string> = {
  pending: 'border-border bg-muted text-muted-foreground',
  in_progress: 'border-primary/20 bg-primary/10 text-primary',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-destructive/20 bg-destructive text-white',
  cancelled: 'border-border bg-background text-muted-foreground',
};

const IN_PROGRESS_STATUSES = new Set<JobStatus | UrlCheckStatus>([
  'in_progress',
]);

export const getJobStatusLabel = (status: JobStatus) => {
  return JOB_STATUS_LABELS[status];
};

export const getUrlStatusLabel = (status: UrlCheckStatus) => {
  return URL_STATUS_LABELS[status];
};

export const isTerminalJobStatus = (status: JobStatus) => {
  return TERMINAL_JOB_STATUSES.has(status);
};

export const isRunningJobStatus = (status: JobStatus) => {
  return RUNNING_JOB_STATUSES.has(status);
};

export const canCancelJob = (status: JobStatus) => {
  return isRunningJobStatus(status);
};

export const hasInProgressSpinner = (status: JobStatus | UrlCheckStatus) => {
  return IN_PROGRESS_STATUSES.has(status);
};
