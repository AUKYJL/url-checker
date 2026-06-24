import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import type { JobDetail } from '../model';
import { isTerminalJobStatus, jobQueryKeys } from '../model';

export const useInvalidateJobsOnCompletion = (
  status: JobDetail['status'] | undefined,
): void => {
  const queryClient = useQueryClient();
  const previousActiveJobStatusRef = useRef<JobDetail['status'] | null>(null);

  useEffect(() => {
    const currentStatus = status ?? null;
    const previousStatus = previousActiveJobStatusRef.current;

    if (
      currentStatus &&
      isTerminalJobStatus(currentStatus) &&
      previousStatus &&
      !isTerminalJobStatus(previousStatus)
    ) {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.list() });
    }

    previousActiveJobStatusRef.current = currentStatus;
  }, [queryClient, status]);
};
