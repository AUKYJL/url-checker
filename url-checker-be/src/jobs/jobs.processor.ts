import { Injectable } from '@nestjs/common';

import { getArtificialDelayMs, wait } from '@/shared/model/utils';

import { JobsStore } from './jobs.store';
import {
  JOB_STATUS,
  Job,
  URL_CHECK_STATUS,
  UrlCheckResult,
} from './types/job.types';

const MAX_CONCURRENT_URLS = 5;
const REQUEST_TIMEOUT_MS = 10_000;

@Injectable()
export class JobsProcessor {
  private readonly activeControllers = new Map<
    string,
    Map<string, AbortController>
  >();

  constructor(private readonly jobsStore: JobsStore) {}

  async process(jobId: string): Promise<void> {
    const initialJob = this.jobsStore.findById(jobId);

    if (!initialJob || initialJob.status !== JOB_STATUS.PENDING) {
      return;
    }

    initialJob.status = JOB_STATUS.IN_PROGRESS;
    this.jobsStore.update(initialJob);
    this.activeControllers.set(jobId, new Map<string, AbortController>());

    const queue = [...initialJob.urls];
    let processorFailed = false;

    try {
      const workerCount = Math.min(MAX_CONCURRENT_URLS, queue.length);
      const workers = Array.from({ length: workerCount }, () =>
        this.runWorker(jobId, queue),
      );
      const results = await Promise.allSettled(workers);

      processorFailed = results.some((result) => result.status === 'rejected');
    } catch {
      processorFailed = true;
    } finally {
      this.activeControllers.delete(jobId);

      const currentJob = this.jobsStore.findById(jobId);

      if (currentJob && currentJob.status !== JOB_STATUS.CANCELLED) {
        currentJob.status = processorFailed
          ? JOB_STATUS.FAILED
          : JOB_STATUS.COMPLETED;
      }

      if (currentJob) {
        this.jobsStore.update(currentJob);
      }
    }
  }

  cancel(jobId: string): void {
    const controllers = this.activeControllers.get(jobId);

    if (!controllers) {
      return;
    }

    controllers.forEach((controller) => controller.abort());
  }

  private async runWorker(
    jobId: string,
    queue: UrlCheckResult[],
  ): Promise<void> {
    while (queue.length > 0) {
      const job = this.jobsStore.findById(jobId);

      if (!job || job.status === JOB_STATUS.CANCELLED) {
        return;
      }

      const nextItem = queue.shift();

      if (!nextItem || nextItem.status !== URL_CHECK_STATUS.PENDING) {
        continue;
      }

      const liveItem = job.urls.find((item) => item.id === nextItem.id);

      if (!liveItem || liveItem.status !== URL_CHECK_STATUS.PENDING) {
        continue;
      }

      await this.processUrlItem(job, liveItem);
    }
  }

  private async processUrlItem(job: Job, item: UrlCheckResult): Promise<void> {
    const latestJob = this.jobsStore.findById(job.id);

    if (
      !latestJob ||
      latestJob.status === JOB_STATUS.CANCELLED ||
      item.status !== URL_CHECK_STATUS.PENDING
    ) {
      return;
    }

    const startedAt = new Date();
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);
    const jobControllers = this.activeControllers.get(job.id);

    if (!jobControllers) {
      clearTimeout(timeoutId);
      return;
    }

    item.status = URL_CHECK_STATUS.IN_PROGRESS;
    item.startedAt = startedAt.toISOString();
    this.jobsStore.update(job);
    jobControllers.set(item.id, controller);

    let finalStatus: URL_CHECK_STATUS = URL_CHECK_STATUS.SUCCESS;
    let httpStatus: number | undefined;
    let error: string | undefined;

    try {
      const response = await fetch(item.url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      httpStatus = response.status;

      if (!response.ok) {
        finalStatus = URL_CHECK_STATUS.ERROR;
        error = `HTTP status ${response.status}`;
      }
    } catch (caughtError) {
      const isCancelled = this.isJobCancellation(
        job.id,
        controller.signal,
        timedOut,
        caughtError,
      );
      finalStatus = isCancelled
        ? URL_CHECK_STATUS.CANCELLED
        : URL_CHECK_STATUS.ERROR;
      error = this.getErrorMessage(caughtError, {
        cancelled: isCancelled,
        timedOut,
      });
    } finally {
      clearTimeout(timeoutId);
      jobControllers.delete(item.id);
    }

    await wait(getArtificialDelayMs());

    const currentJob = this.jobsStore.findById(job.id);

    if (!currentJob) {
      return;
    }

    const currentItem = currentJob.urls.find(
      (urlCheck) => urlCheck.id === item.id,
    );

    if (!currentItem) {
      return;
    }

    const cancelledJob = currentJob.status === JOB_STATUS.CANCELLED;
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();

    currentItem.status = cancelledJob
      ? URL_CHECK_STATUS.CANCELLED
      : finalStatus;
    currentItem.httpStatus = httpStatus;
    currentItem.error = cancelledJob
      ? (currentItem.error ?? URL_CHECK_STATUS.CANCELLED)
      : error;
    currentItem.finishedAt = finishedAt.toISOString();
    currentItem.durationMs = durationMs;

    this.jobsStore.update(currentJob);
  }

  private isJobCancellation(
    jobId: string,
    signal: AbortSignal,
    timedOut: boolean,
    error: unknown,
  ): boolean {
    if (timedOut) {
      return false;
    }

    const job = this.jobsStore.findById(jobId);

    return (
      job?.status === JOB_STATUS.CANCELLED ||
      signal.aborted ||
      (error instanceof Error && error.name === 'AbortError')
    );
  }

  private getErrorMessage(
    error: unknown,
    options: { cancelled: boolean; timedOut: boolean },
  ): string {
    if (options.cancelled) {
      return 'Cancelled';
    }

    if (options.timedOut) {
      return 'Request timed out';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}
