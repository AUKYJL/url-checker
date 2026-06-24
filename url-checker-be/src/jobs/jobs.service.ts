import { Injectable, Logger } from '@nestjs/common';

import { createJobNotFoundException } from '@/shared/http/httpResponseTexts';

import { CreateJobDto } from './dto/createJob.dto';
import { JobsProcessor } from './jobs.processor';
import { JobsStore } from './jobs.store';
import {
  JOB_STATUS,
  Job,
  JobCounts,
  JobDetail,
  JobSummary,
  URL_CHECK_STATUS,
} from './types/job.types';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly jobsStore: JobsStore,
    private readonly jobsProcessor: JobsProcessor,
  ) {}

  createJob(dto: CreateJobDto): { jobId: string } {
    const normalizedUrls = dto.urls.map((url) => url.trim());
    const job = this.jobsStore.create(normalizedUrls);

    this.jobsProcessor.process(job.id).catch((error: unknown) => {
      this.logger.error(
        `Background processing failed for job ${job.id}`,
        error,
      );
    });

    return { jobId: job.id };
  }

  getJobs(): JobSummary[] {
    return this.jobsStore
      .findAll()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((job) => this.toJobSummary(job));
  }

  getJobById(id: string): JobDetail {
    const job = this.jobsStore.findById(id);

    if (!job) {
      throw createJobNotFoundException(id);
    }

    return this.toJobDetail(job);
  }

  cancelJob(id: string): JobDetail {
    const existingJob = this.jobsStore.findById(id);

    if (!existingJob) {
      throw createJobNotFoundException(id);
    }

    if (
      existingJob.status === JOB_STATUS.COMPLETED ||
      existingJob.status === JOB_STATUS.CANCELLED ||
      existingJob.status === JOB_STATUS.FAILED
    ) {
      return this.toJobDetail(existingJob);
    }

    const cancelledJob = this.jobsStore.cancel(id);

    if (!cancelledJob) {
      throw createJobNotFoundException(id);
    }

    this.jobsProcessor.cancel(id);

    return this.toJobDetail(cancelledJob);
  }

  private toJobSummary(job: Job): JobSummary {
    return {
      id: job.id,
      createdAt: job.createdAt,
      status: job.status,
      ...this.getJobCounts(job),
    };
  }

  private toJobDetail(job: Job): JobDetail {
    return {
      ...this.toJobSummary(job),
      urls: job.urls.map((url) => ({ ...url })),
    };
  }

  private getJobCounts(job: Job): JobCounts {
    return job.urls.reduce<JobCounts>(
      (counts, item) => {
        counts.total += 1;

        switch (item.status) {
          case URL_CHECK_STATUS.SUCCESS:
            counts.success += 1;
            break;
          case URL_CHECK_STATUS.ERROR:
            counts.error += 1;
            break;
          case URL_CHECK_STATUS.PENDING:
            counts.pending += 1;
            break;
          case URL_CHECK_STATUS.IN_PROGRESS:
            counts.inProgress += 1;
            break;
          case URL_CHECK_STATUS.CANCELLED:
            counts.cancelled += 1;
            break;
        }

        return counts;
      },
      {
        total: 0,
        success: 0,
        error: 0,
        pending: 0,
        inProgress: 0,
        cancelled: 0,
      },
    );
  }
}
