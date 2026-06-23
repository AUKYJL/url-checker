import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { JOB_STATUS, Job, URL_CHECK_STATUS } from './types/job.types';

const FINAL_JOB_STATUSES: JOB_STATUS[] = [
  JOB_STATUS.COMPLETED,
  JOB_STATUS.CANCELLED,
  JOB_STATUS.FAILED,
];
const FINAL_URL_STATUSES: URL_CHECK_STATUS[] = [
  URL_CHECK_STATUS.SUCCESS,
  URL_CHECK_STATUS.ERROR,
  URL_CHECK_STATUS.CANCELLED,
];

@Injectable()
export class JobsStore {
  private readonly jobs = new Map<string, Job>();

  create(urls: string[]): Job {
    const job: Job = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      status: JOB_STATUS.PENDING,
      urls: urls.map((url) => ({
        id: randomUUID(),
        url,
        status: URL_CHECK_STATUS.PENDING,
      })),
    };

    this.jobs.set(job.id, job);

    return job;
  }

  findAll(): Job[] {
    return Array.from(this.jobs.values());
  }

  findById(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  update(job: Job): void {
    this.jobs.set(job.id, job);
  }

  cancel(id: string): Job | undefined {
    const job = this.jobs.get(id);

    if (!job) {
      return undefined;
    }

    if (FINAL_JOB_STATUSES.includes(job.status)) {
      return job;
    }

    job.status = JOB_STATUS.CANCELLED;

    job.urls.forEach((urlCheck) => {
      if (!FINAL_URL_STATUSES.includes(urlCheck.status)) {
        urlCheck.status = URL_CHECK_STATUS.CANCELLED;
      }
    });

    this.jobs.set(job.id, job);

    return job;
  }
}
