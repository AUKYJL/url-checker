export enum JOB_STATUS {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum URL_CHECK_STATUS {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

export interface UrlCheckResult {
  id: string;
  url: string;
  status: URL_CHECK_STATUS;
  httpStatus?: number;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
}

export interface Job {
  id: string;
  createdAt: string;
  status: JOB_STATUS;
  urls: UrlCheckResult[];
}

export interface JobCounts {
  total: number;
  success: number;
  error: number;
  pending: number;
  inProgress: number;
  cancelled: number;
}

export interface JobSummary extends JobCounts {
  id: string;
  createdAt: string;
  status: JOB_STATUS;
}

export interface JobDetail extends JobSummary {
  urls: UrlCheckResult[];
}
