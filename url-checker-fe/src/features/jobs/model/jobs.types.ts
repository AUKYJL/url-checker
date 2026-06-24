import type { components } from '@/shared/api/apiTypes';

type ApiSchemas = components['schemas'];

export type CreateJobPayload = ApiSchemas['CreateJobDto'];
export type CreateJobResponse = ApiSchemas['CreateJobResponseDto'];
export type JobSummary = ApiSchemas['JobSummaryDto'];
export type JobDetail = ApiSchemas['JobDetailDto'];
export type UrlCheckResult = ApiSchemas['UrlCheckResultDto'];
export type JobStatus = JobSummary['status'];
export type UrlCheckStatus = UrlCheckResult['status'];
