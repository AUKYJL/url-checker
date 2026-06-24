import { AlertCircle, Ban, Clock3, LoaderCircle } from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Separator,
  Skeleton,
} from '@/shared/ui';

import type { JobDetail } from '../model';
import {
  canCancelJob,
  formatCreatedAt,
  getApiErrorMessages,
  getProcessedCount,
  getProgressPercent,
} from '../model';

import { StatusBadge, UrlResultsTable } from './';
import { cn } from '@/model/utils';

type ActiveJobDetailsProps = {
  error?: unknown;
  isCancelPending: boolean;
  isLoading: boolean;
  job?: JobDetail;
  onCancel: (jobId: string) => void;
};

export const ActiveJobDetails = ({
  error,
  isCancelPending,
  isLoading,
  job,
  onCancel,
}: ActiveJobDetailsProps) => {
  if (isLoading) {
    return (
      <Card className="border-stone-200 bg-stone-50/95 shadow-lg shadow-stone-200/40">
        <CardHeader className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="border-destructive/20 bg-stone-50/95"
      >
        <AlertCircle className="size-4" />
        <AlertTitle>Не удалось загрузить задачу</AlertTitle>
        <AlertDescription>
          {getApiErrorMessages(error).map((message) => (
            <p key={message}>{message}</p>
          ))}
        </AlertDescription>
      </Alert>
    );
  }

  if (!job) {
    return null;
  }

  const processedCount = getProcessedCount(job);
  const progress = getProgressPercent(job);
  const isCancelable = canCancelJob(job.status);

  return (
    <Card className="min-w-0 border-stone-200 bg-stone-50/95 shadow-lg shadow-stone-200/40 backdrop-blur">
      <CardHeader className="gap-4 px-5 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-xl">Детали задачи</CardTitle>
              <StatusBadge kind="job" status={job.status} />
            </div>
            <CardDescription className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <span className="font-mono text-xs break-all">ID: {job.id}</span>
              <span className="flex items-center gap-1.5">
                <Clock3 className="size-4" />
                {formatCreatedAt(job.createdAt)}
              </span>
            </CardDescription>
          </div>

          {isCancelable ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isCancelPending}
                  className="w-full sm:w-auto"
                >
                  {isCancelPending ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      Отменяем
                    </>
                  ) : (
                    <>
                      <Ban />
                      Отменить задачу
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Отменить задачу?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Проверка остановится, а ещё не обработанные URL перейдут в
                    статус отмены.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Назад</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => onCancel(job.id)}
                  >
                    Подтвердить отмену
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-5 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Всего URL" value={job.total} />
          <MetricCard
            label="Обработано"
            value={`${processedCount}/${job.total}`}
          />
          <MetricCard
            label="Успешно"
            value={job.success}
            accent="text-emerald-700"
          />
          <MetricCard label="Ошибки" value={job.error} accent="text-rose-700" />
        </div>

        <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-100/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Прогресс выполнения</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="text-muted-foreground grid gap-2 text-xs sm:grid-cols-3">
            <span>В очереди: {job.pending}</span>
            <span>В работе: {job.inProgress}</span>
            <span>Отменено: {job.cancelled}</span>
          </div>
        </div>

        <Separator />

        <div className="min-w-0 space-y-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Результаты по URL</h3>
            <p className="text-muted-foreground text-sm">
              Таблица обновляется автоматически.
            </p>
          </div>
          <UrlResultsTable results={job.urls} />
        </div>
      </CardContent>
    </Card>
  );
};

const MetricCard = ({
  accent,
  label,
  value,
}: {
  accent?: string;
  label: string;
  value: number | string;
}) => {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-100/70 p-4">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className={cn('mt-2 text-2xl font-semibold tracking-tight', accent)}>
        {value}
      </div>
    </div>
  );
};
