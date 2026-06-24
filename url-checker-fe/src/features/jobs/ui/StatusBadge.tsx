import { LoaderCircle } from 'lucide-react';

import { Badge } from '@/shared/ui';

import {
  JOB_STATUS_BADGE_CLASS_NAMES,
  URL_STATUS_BADGE_CLASS_NAMES,
  getJobStatusLabel,
  getUrlStatusLabel,
  hasInProgressSpinner,
} from '../model';
import type { JobStatus, UrlCheckStatus } from '../model';

type StatusBadgeProps =
  | {
      kind: 'job';
      status: JobStatus;
    }
  | {
      kind: 'url';
      status: UrlCheckStatus;
    };

export const StatusBadge = (props: StatusBadgeProps) => {
  const label =
    props.kind === 'job'
      ? getJobStatusLabel(props.status)
      : getUrlStatusLabel(props.status);
  const className =
    props.kind === 'job'
      ? JOB_STATUS_BADGE_CLASS_NAMES[props.status]
      : URL_STATUS_BADGE_CLASS_NAMES[props.status];

  return (
    <Badge variant="outline" className={className}>
      {hasInProgressSpinner(props.status) ? (
        <LoaderCircle className="size-3 animate-spin" />
      ) : null}
      {label}
    </Badge>
  );
};
