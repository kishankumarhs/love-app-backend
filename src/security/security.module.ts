import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from '../common/guards/rate-limit.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 20, // 20 requests per minute
      },
      {
        name: 'medium',
        ttl: 600000, // 10 minutes
        limit: 100, // 100 requests per 10 minutes
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 500, // 500 requests per hour
      },
    ]),
  ],
  providers: [CustomThrottlerGuard],
  exports: [CustomThrottlerGuard],
})
export class SecurityModule {}
