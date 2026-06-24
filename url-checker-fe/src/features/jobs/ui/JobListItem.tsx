import { Clock3 } from 'lucide-react';

import { cn } from '@/shared/model/utils';
import { Card, CardContent, Progress } from '@/shared/ui';

import type { JobSummary } from '../model';
import {
  formatCreatedAt,
  getProcessedCount,
  getProgressPercent,
  getShortJobId,
} from '../model';

import { StatusBadge } from './';

type JobListItemProps = {
  isActive: boolean;
  job: JobSummary;
  onSelect: (jobId: string) => void;
};

export const JobListItem = ({
  isActive,
  job,
  onSelect,
}: JobListItemProps) => {
  const processedCount = getProcessedCount(job);
  const progress = getProgressPercent(job);

  return (
    <button
      type="button"
      className="min-w-0 w-full text-left"
      onClick={() => onSelect(job.id)}
    >
      <Card
        className={cn(
          'min-w-0 gap-0 border-stone-200 bg-stone-50 py-0 transition hover:-translate-y-0.5 hover:shadow-md',
          isActive &&
            'border-primary/30 bg-primary/5 shadow-primary/10 shadow-md',
        )}
      >
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-semibold">
                Job {getShortJobId(job.id)}
              </div>
              <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                <Clock3 className="size-3.5" />
                {formatCreatedAt(job.createdAt)}
              </div>
            </div>
            <StatusBadge kind="job" status={job.status} />
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="text-muted-foreground text-xs">Всего</div>
              <div className="font-medium">{job.total}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Обработано</div>
              <div className="font-medium">
                {processedCount}/{job.total}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Успех</div>
              <div className="font-medium text-emerald-700">{job.success}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Ошибки</div>
              <div className="font-medium text-rose-700">{job.error}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>Прогресс</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>
    </button>
  );
};
