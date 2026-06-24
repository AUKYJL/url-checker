import { ApiProperty } from '@nestjs/swagger';

import { JOB_STATUS, URL_CHECK_STATUS } from '../types/job.types';

export class CreateJobResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Идентификатор созданной задачи',
  })
  jobId: string;
}

export class JobCountsDto {
  @ApiProperty({ example: 3 })
  total: number;

  @ApiProperty({ example: 2 })
  success: number;

  @ApiProperty({ example: 1 })
  error: number;

  @ApiProperty({ example: 0 })
  pending: number;

  @ApiProperty({ example: 0 })
  inProgress: number;

  @ApiProperty({ example: 0 })
  cancelled: number;
}

export class UrlCheckResultDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  id: string;

  @ApiProperty({ example: 'https://example.com' })
  url: string;

  @ApiProperty({ enum: URL_CHECK_STATUS, example: URL_CHECK_STATUS.SUCCESS })
  status: URL_CHECK_STATUS;

  @ApiProperty({
    example: 200,
    required: false,
    nullable: true,
    description: 'HTTP-статус, полученный при HEAD-запросе, если он доступен',
  })
  httpStatus?: number;

  @ApiProperty({
    example: 'HTTP-статус 500',
    required: false,
    nullable: true,
    description:
      'Текст ошибки для неуспешных или завершившихся по таймауту проверок',
  })
  error?: string;

  @ApiProperty({
    example: '2026-06-23T10:00:00.000Z',
    required: false,
    nullable: true,
  })
  startedAt?: string;

  @ApiProperty({
    example: '2026-06-23T10:00:01.123Z',
    required: false,
    nullable: true,
    description: 'Время завершения фактически выполненной проверки',
  })
  finishedAt?: string;

  @ApiProperty({
    example: 1123,
    required: false,
    nullable: true,
    description: 'Длительность фактически выполненной проверки в миллисекундах',
  })
  durationMs?: number;
}

export class JobSummaryDto extends JobCountsDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '2026-06-23T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ enum: JOB_STATUS, example: JOB_STATUS.COMPLETED })
  status: JOB_STATUS;
}

export class JobDetailDto extends JobSummaryDto {
  @ApiProperty({ type: () => [UrlCheckResultDto] })
  urls: UrlCheckResultDto[];
}
