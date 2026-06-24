import { SearchX } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui';

export const EmptyJobState = () => {
  return (
    <Card className="border-stone-200 border-dashed bg-stone-50/95">
      <CardHeader className="gap-3">
        <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
          <SearchX className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle>Нет выбранной проверки</CardTitle>
          <CardDescription>
            Создайте новую задачу слева или выберите одну из последних проверок,
            чтобы увидеть детальный прогресс и результаты по каждому URL.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        После запуска проверка начнёт обновляться автоматически, пока не
        перейдёт в финальный статус.
      </CardContent>
    </Card>
  );
};
