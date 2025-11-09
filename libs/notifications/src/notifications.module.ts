import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { NotificationTemplate } from './entities/notification-template.entity';
import { Notification } from './entities/notification.entity';
import { User } from '@love-app/common/entities/user.entity';

import { NotificationsService } from './notifications.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { TemplateService } from './services/template.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationTemplate, Notification, User]),
    ConfigModule,
  ],
  providers: [
    NotificationsService,
    EmailService,
    SmsService,
    TemplateService,
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}