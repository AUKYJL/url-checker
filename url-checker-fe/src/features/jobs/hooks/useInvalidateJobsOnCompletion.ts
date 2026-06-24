import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import type { JobDetail } from '../model';
import { hasUnfinishedUrls, jobQueryKeys } from '../model';

export const useInvalidateJobsOnCompletion = (
  urls: JobDetail['urls'] | undefined,
): void => {
  const queryClient = useQueryClient();
  const previousHasUnfinishedUrlsRef = useRef(false);

  useEffect(() => {
    const currentHasUnfinishedUrls = hasUnfinishedUrls(urls);
    const previousHasUnfinishedUrls = previousHasUnfinishedUrlsRef.current;

    if (previousHasUnfinishedUrls && !currentHasUnfinishedUrls) {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.list() });
    }

    previousHasUnfinishedUrlsRef.current = currentHasUnfinishedUrls;
  }, [queryClient, urls]);
};
