import { Module } from '@nestjs/common';

import { JobsController } from './jobs.controller';
import { JobsProcessor } from './jobs.processor';
import { JobsService } from './jobs.service';
import { JobsStore } from './jobs.store';

@Module({
  controllers: [JobsController],
  providers: [JobsStore, JobsProcessor, JobsService],
})
export class JobsModule {}
