import { AlertCircle, LoaderCircle, Play } from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Textarea,
} from '@/shared/ui';

import { getApiErrorMessages, normalizeUrlsInput } from '../model';

type CreateJobCardProps = {
  value: string;
  isPending: boolean;
  onValueChange: (value: string) => void;
  onSubmit: (urls: string[]) => void;
  error?: unknown;
};

export const CreateJobCard = ({
  value,
  isPending,
  onValueChange,
  onSubmit,
  error,
}: CreateJobCardProps) => {
  const normalizedUrls = normalizeUrlsInput(value);
  const errorMessages = error ? getApiErrorMessages(error) : [];

  const handleSubmit = () => {
    if (normalizedUrls.length === 0 || isPending) {
      return;
    }

    onSubmit(normalizedUrls);
  };

  return (
    <Card className="border-stone-200 bg-stone-50/95 shadow-lg shadow-stone-200/40 backdrop-blur">
      <CardHeader className="space-y-2 px-5 sm:px-6">
        <div className="space-y-1">
          <CardTitle>Новая проверка URL</CardTitle>
          <CardDescription>Вставьте по одному URL на строку.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-5 sm:px-6">
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={'https://example.com\nhttps://openai.com'}
            className="min-h-44 resize-y border-stone-200 bg-white/80"
          />
          <div className="text-muted-foreground flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>Распознано URL: {normalizedUrls.length}</span>
          </div>
        </div>

        {errorMessages.length > 0 ? (
          <Alert variant="destructive" className="border-destructive/20">
            <AlertCircle className="size-4" />
            <AlertTitle>Не удалось создать задачу</AlertTitle>
            <AlertDescription>
              {errorMessages.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </AlertDescription>
          </Alert>
        ) : null}

        <Button
          onClick={handleSubmit}
          disabled={normalizedUrls.length === 0 || isPending}
          className="w-full"
          size="lg"
        >
          {isPending ? (
            <>
              <LoaderCircle className="animate-spin" />
              Запускаем проверку
            </>
          ) : (
            <>
              <Play />
              Запустить проверку
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
