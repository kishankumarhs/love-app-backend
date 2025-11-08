import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TemplateService } from './services/template.service';
import { EmailService } from './services/email.service';
import { SMSService } from './services/sms.service';
import { NotificationGateway } from './gateways/notification.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationPreference,
      NotificationTemplate,
    ]),
    JwtModule.register({}),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    TemplateService,
    EmailService,
    SMSService,
    NotificationGateway,
  ],
  exports: [
    NotificationService,
    TemplateService,
    EmailService,
    SMSService,
    NotificationGateway,
  ],
})
export class NotificationModule {}