import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui';

import type { JobSummary } from '../model';

import { JobListItem } from './';

type JobsListProps = {
  activeJobId: string | null;
  isLoading: boolean;
  jobs: JobSummary[];
  onSelect: (jobId: string) => void;
};

export const JobsList = ({
  activeJobId,
  isLoading,
  jobs,
  onSelect,
}: JobsListProps) => {
  return (
    <Card className="min-w-0 border-stone-200 bg-stone-50/95 shadow-lg shadow-stone-200/40 backdrop-blur">
      <CardHeader className="space-y-2 px-5 sm:px-6">
        <div className="space-y-1">
          <CardTitle>Последние задачи</CardTitle>
          <CardDescription>
            Выберите задачу, чтобы посмотреть ее детальную информацию.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-5 sm:px-6">
        {isLoading ? (
          <div className="text-muted-foreground text-sm">
            Загружаем историю задач…
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed border-stone-200 bg-stone-50 p-6 text-sm">
            Пока нет ни одной проверки. Создайте первую задачу выше.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobListItem
                key={job.id}
                job={job}
                isActive={job.id === activeJobId}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
