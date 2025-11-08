import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './guards/throttler.guard';
import { AuthController } from './controllers/auth.controller';
import { NotificationController } from './controllers/notification.controller';
import { SOSController } from './controllers/sos.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'medium',
        ttl: 600000,
        limit: 500,
      },
      {
        name: 'long',
        ttl: 3600000,
        limit: 2000,
      },
    ]),
  ],
  controllers: [
    AuthController,
    NotificationController,
    SOSController,
    HealthController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
