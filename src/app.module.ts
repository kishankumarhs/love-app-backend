import {
  Module,
  MiddlewareConsumer,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import stripeConfig from './config/stripe.config';
import { SecurityModule } from './security/security.module';
import { CustomThrottlerGuard } from './common/guards/rate-limit.guard';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';


// Core modules
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProviderModule } from './provider/provider.module';
import { CampaignModule } from './campaign/campaign.module';
import { RequestsModule } from './requests/requests.module';
import { DonationsModule } from './donations/donations.module';
import { SOSModule } from './sos/sos.module';
import { VolunteerModule } from './volunteer/volunteer.module';
import { ConnectivityModule } from './connectivity/connectivity.module';
import { ReviewModule } from './review/review.module';
import { NotificationModule } from './notification/notification.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
// import { I18nCustomModule } from './i18n/i18n.module';
import { CommonModule } from './common/common.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { Country } from './user/entities/countries.entity';

import firebaseConfig from './config/firebase.config';
import { CategoryModule } from './category/category.module';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [
    NestjsFormDataModule.config({
      isGlobal: true, // Applies to all routes automatically
      storage: MemoryStoredFile // Keeps files in memory for easy access
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        appConfig,
        jwtConfig,
        stripeConfig,
        firebaseConfig,
      ],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    TypeOrmModule.forFeature([Country]),
    // Core modules
    AuthModule,
    UserModule,
    ProviderModule,
    CategoryModule,
    CampaignModule,
    RequestsModule,
    DonationsModule,
    SOSModule,
    VolunteerModule,
    ConnectivityModule,
    ReviewModule,
    NotificationModule,
    AdminModule,
    AuditModule,
    SecurityModule,
    // I18nCustomModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly dataSource: DataSource) { }

  onModuleInit() {
    try {
      const names = this.dataSource.entityMetadatas.map((m) => m.name);
      // eslint-disable-next-line no-console
      console.log('TypeORM loaded entities:', names);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('error listing TypeORM entities', e);
    }
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
