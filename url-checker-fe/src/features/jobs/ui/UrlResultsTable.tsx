import { CircleSlash } from 'lucide-react';

import {
  ScrollArea,
  ScrollBar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui';

import type { UrlCheckResult } from '../model';
import { formatDurationMs, formatHttpStatus } from '../model';

import { StatusBadge } from './';

type UrlResultsTableProps = {
  results: UrlCheckResult[];
};

export const UrlResultsTable = ({ results }: UrlResultsTableProps) => {
  if (results.length === 0) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 rounded-xl border border-dashed p-6 text-sm">
        <CircleSlash className="size-4" />В этой задаче пока нет
        URL-результатов.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="w-full rounded-xl border **:data-[slot=table-container]:overflow-visible">
        <Table className="min-w-180">
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-50">URL</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>HTTP</TableHead>
              <TableHead>Длительность</TableHead>
              <TableHead className="w-50">Ошибка</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="max-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block truncate font-medium">
                        {result.url}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md whitespace-normal break-all">
                      {result.url}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <StatusBadge kind="url" status={result.status} />
                </TableCell>
                <TableCell>{formatHttpStatus(result.httpStatus)}</TableCell>
                <TableCell>{formatDurationMs(result.durationMs)}</TableCell>
                <TableCell className="max-w-0">
                  {result.error ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted-foreground block truncate">
                          {result.error}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md whitespace-normal break-words">
                        {result.error}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </TooltipProvider>
  );
};
