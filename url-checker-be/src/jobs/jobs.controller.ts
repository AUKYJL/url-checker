import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import {
  NotFoundErrorResponseDto,
  ValidationErrorResponseDto,
} from '@/shared/dto/errorResponse.dto';

import { CreateJobDto } from './dto/createJob.dto';
import {
  CreateJobResponseDto,
  JobDetailDto,
  JobSummaryDto,
} from './dto/jobResponse.dto';
import { JobsService } from './jobs.service';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую задачу проверки URL' })
  @ApiBody({ type: CreateJobDto })
  @ApiCreatedResponse({ type: CreateJobResponseDto })
  @ApiBadRequestResponse({ type: ValidationErrorResponseDto })
  createJob(@Body() dto: CreateJobDto) {
    return this.jobsService.createJob(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех задач проверки URL' })
  @ApiOkResponse({ type: JobSummaryDto, isArray: true })
  getJobs() {
    return this.jobsService.getJobs();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить задачу по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор задачи' })
  @ApiOkResponse({ type: JobDetailDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  getJobById(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Отменить задачу по идентификатору' })
  @ApiParam({ name: 'id', description: 'Идентификатор задачи' })
  @ApiOkResponse({ type: JobDetailDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  cancelJob(@Param('id') id: string) {
    return this.jobsService.cancelJob(id);
  }
}
