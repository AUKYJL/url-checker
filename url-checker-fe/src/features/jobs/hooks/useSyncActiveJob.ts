import { useEffect } from 'react';

import type { JobSummary } from '../model';

type UseSyncActiveJobParams = {
  jobs: JobSummary[];
  activeJobId: string | null;
  setActiveJobId: (jobId: string | null) => void;
};

export const useSyncActiveJob = ({
  jobs,
  activeJobId,
  setActiveJobId,
}: UseSyncActiveJobParams): void => {
  useEffect(() => {
    if (jobs.length === 0) {
      if (activeJobId !== null) {
        setActiveJobId(null);
      }

      return;
    }

    const hasActiveJob = activeJobId
      ? jobs.some((job) => job.id === activeJobId)
      : false;

    if (!hasActiveJob) {
      setActiveJobId(jobs[jobs.length - 1].id);
    }
  }, [activeJobId, jobs, setActiveJobId]);
};
