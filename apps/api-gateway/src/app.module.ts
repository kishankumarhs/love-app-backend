import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
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
        limit: 100, // Increased for high traffic
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
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: 'auth-service', port: 3001 },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.TCP,
        options: { host: 'notification-service', port: 3002 },
      },
      {
        name: 'SOS_SERVICE',
        transport: Transport.TCP,
        options: { host: 'sos-service', port: 3003 },
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