import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { $api } from '@/shared/api/apiInstance';

import { useInvalidateJobsOnCompletion, useSyncActiveJob } from './hooks';
import type { JobSummary } from './model';
import {
  hasUnfinishedUrls,
  isRunningJobStatus,
  jobQueryKeys,
  jobQueryOptions,
  useJobsStore,
} from './model';
import { ActiveJobDetails, CreateJobCard, EmptyJobState, JobsList } from './ui';

const EMPTY_JOBS: JobSummary[] = [];

export const JobsDashboard = () => {
  const queryClient = useQueryClient();
  const activeJobId = useJobsStore((s) => s.activeJobId);
  const setActiveJobId = useJobsStore((s) => s.setActiveJobId);
  const [draftUrls, setDraftUrls] = useState('');

  const activeJobQuery = useQuery({
    ...jobQueryOptions.detail(activeJobId ?? ''),
    enabled: Boolean(activeJobId),
    refetchInterval: (query) => {
      const data = query.state.data;
      const ACTIVE_JOB_POLLING_INTERVAL_MS = 1200;
      const shouldStopPolling = data && !hasUnfinishedUrls(data.urls);

      return shouldStopPolling ? false : ACTIVE_JOB_POLLING_INTERVAL_MS;
    },
  });

  const jobsQuery = useQuery({
    ...jobQueryOptions.list(),
    refetchInterval: (query) => {
      const data = query.state.data ?? [];
      const JOBS_POLLING_INTERVAL_MS = 3000;
      const hasActiveJobWithUnfinishedUrls = hasUnfinishedUrls(
        activeJobQuery.data?.urls,
      );
      const shouldPollJobs =
        data.some((job) => isRunningJobStatus(job.status)) ||
        hasActiveJobWithUnfinishedUrls;

      return shouldPollJobs ? JOBS_POLLING_INTERVAL_MS : false;
    },
  });

  const createJobMutation = $api.useMutation('post', '/api/jobs', {
    onSuccess: async (data) => {
      setDraftUrls('');
      setActiveJobId(data.jobId);
      await queryClient.invalidateQueries({ queryKey: jobQueryKeys.list() });
    },
  });

  const cancelJobMutation = $api.useMutation('delete', '/api/jobs/{id}', {
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: jobQueryKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: jobQueryKeys.detail(variables.params.path.id),
        }),
      ]);
    },
  });

  const jobs = jobsQuery.data ?? EMPTY_JOBS;

  useInvalidateJobsOnCompletion(activeJobQuery.data?.urls);
  useSyncActiveJob({ jobs, activeJobId, setActiveJobId });

  const handleSelectJob = (jobId: string) => {
    setActiveJobId(jobId);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <main className="bg-background min-h-screen overflow-x-clip px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        <section className="space-y-4">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              Проверка URL
            </h1>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-6">
            <CreateJobCard
              error={createJobMutation.error}
              isPending={createJobMutation.isPending}
              onValueChange={setDraftUrls}
              onSubmit={(urls) => createJobMutation.mutate({ body: { urls } })}
              value={draftUrls}
            />
            <JobsList
              activeJobId={activeJobId}
              isLoading={jobsQuery.isLoading}
              jobs={jobs}
              onSelect={handleSelectJob}
            />
          </div>

          <div className="min-w-0">
            {activeJobId ? (
              <ActiveJobDetails
                error={activeJobQuery.error}
                isCancelPending={cancelJobMutation.isPending}
                isLoading={activeJobQuery.isLoading}
                job={activeJobQuery.data}
                onCancel={(jobId) =>
                  cancelJobMutation.mutate({
                    params: { path: { id: jobId } },
                  })
                }
              />
            ) : (
              <EmptyJobState />
            )}
          </div>
        </section>
      </div>
    </main>
  );
};
