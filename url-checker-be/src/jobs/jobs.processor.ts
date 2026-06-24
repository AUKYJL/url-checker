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
    this.activeControllers.delete(jobId);
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
        error = `HTTP-статус ${response.status}`;
      }
    } catch (caughtError) {
      finalStatus = URL_CHECK_STATUS.ERROR;
      error = this.getErrorMessage(caughtError, timedOut);
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

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();

    currentItem.status = finalStatus;
    currentItem.httpStatus = httpStatus;
    currentItem.error = error;
    currentItem.finishedAt = finishedAt.toISOString();
    currentItem.durationMs = durationMs;

    this.jobsStore.update(currentJob);
  }

  private getErrorMessage(error: unknown, timedOut: boolean): string {
    if (timedOut) {
      return 'Время ожидания запроса истекло';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Неизвестная ошибка';
  }
}
