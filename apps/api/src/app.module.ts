import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Configuration
import { databaseConfig } from './config/database.config';
import { appConfig } from './config/app.config';

// Shared libraries
import { AuthModule } from '@love-app/auth';
import { ProvidersModule } from '@love-app/providers';
import { DonationsModule } from '@love-app/donations';
import { SlotsModule } from '@love-app/slots';
import { NotificationsModule } from '@love-app/notifications';
import { AuditModule } from '@love-app/audit';
import { ConnectivityModule } from '@love-app/connectivity';

// Guards and interceptors
import { JwtAuthGuard } from '@love-app/auth';
import { AuditInterceptor } from '@love-app/audit';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/../../../libs/**/entities/*.entity{.ts,.js}'],
        synchronize: configService.get('app.env') === 'development',
        logging: configService.get('app.env') === 'development',
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    // Core modules
    AuthModule,
    ProvidersModule,
    DonationsModule,
    SlotsModule,
    NotificationsModule,
    AuditModule,
    ConnectivityModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
