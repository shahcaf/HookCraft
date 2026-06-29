import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EncryptionModule } from './auth/encryption.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { DraftsModule } from './drafts/drafts.module';
import { AuthModule } from './auth/auth.module';

import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        // Prefer REDIS_URL if provided, otherwise construct from host/port.
        url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
        // Required for BullMQ workers to handle blocking commands correctly.
        maxRetriesPerRequest: null,
        // Improves compatibility in Docker environments.
        enableReadyCheck: false,
        // Prevent infinite spamming in dev if Redis is down
        retryStrategy: (times: number) => {
          return Math.min(times * 1000, 10000); // Wait up to 10 seconds between retries
        }
      },
    }),
    PrismaModule,
    EncryptionModule,
    AuthModule,
    WebhooksModule,
    DraftsModule,
  ],
})
export class AppModule {}
