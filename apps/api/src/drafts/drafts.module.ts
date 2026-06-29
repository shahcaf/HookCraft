import { Module } from '@nestjs/common';
import { DraftsService } from './drafts.service';
import { DraftsController } from './drafts.controller';

@Module({
  providers: [DraftsService],
  controllers: [DraftsController],
})
export class DraftsModule {}
