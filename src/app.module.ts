import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';

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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, jwtConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    // Core modules
    AuthModule,
    UserModule,
    ProviderModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
