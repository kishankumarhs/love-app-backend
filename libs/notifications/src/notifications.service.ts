import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification, NotificationStatus } from './entities/notification.entity';
import { NotificationTemplate, NotificationType } from './entities/notification-template.entity';
import { User } from '@love-app/common/entities/user.entity';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { TemplateService } from './services/template.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
    private smsService: SmsService,
    private templateService: TemplateService,
  ) {}

  async sendNotification(
    recipientId: string,
    templateKey: string,
    variables: Record<string, any>,
    type?: NotificationType,
  ) {
    const recipient = await this.userRepository.findOne({
      where: { id: recipientId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    const template = await this.templateService.getTemplate(templateKey);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const notificationType = type || template.type;
    const rendered = await this.templateService.renderTemplate(template, variables);

    // Create notification record
    const notification = this.notificationRepository.create({
      recipient_id: recipientId,
      template_id: template.id,
      type: notificationType,
      subject: rendered.subject,
      body: rendered.body,
      recipient_email: recipient.email,
      recipient_phone: recipient.phone,
      metadata: variables,
    });

    await this.notificationRepository.save(notification);

    // Send notification
    await this.deliverNotification(notification);

    return notification;
  }

  async sendBulkNotification(
    recipientIds: string[],
    templateKey: string,
    variables: Record<string, any>,
    type?: NotificationType,
  ) {
    const results = [];

    for (const recipientId of recipientIds) {
      try {
        const notification = await this.sendNotification(recipientId, templateKey, variables, type);
        results.push({ recipientId, success: true, notificationId: notification.id });
      } catch (error) {
        results.push({ recipientId, success: false, error: error.message });
      }
    }

    return results;
  }

  private async deliverNotification(notification: Notification) {
    let result;

    try {
      switch (notification.type) {
        case NotificationType.EMAIL:
          result = await this.emailService.sendEmail(
            notification.recipient_email,
            notification.subject,
            notification.body,
          );
          break;

        case NotificationType.SMS:
          result = await this.smsService.sendSms(
            notification.recipient_phone,
            notification.body,
          );
          break;

        case NotificationType.PUSH:
          // Push notification implementation would go here
          result = { success: false, error: 'Push notifications not implemented' };
          break;

        default:
          result = { success: false, error: 'Unknown notification type' };
      }

      // Update notification status
      if (result.success) {
        notification.status = NotificationStatus.SENT;
        notification.sent_at = new Date();
        notification.external_id = result.messageId;
      } else {
        notification.status = NotificationStatus.FAILED;
        notification.error_message = result.error;
      }

      await this.notificationRepository.save(notification);
    } catch (error) {
      notification.status = NotificationStatus.FAILED;
      notification.error_message = error.message;
      await this.notificationRepository.save(notification);
    }
  }

  async getNotificationHistory(userId: string, limit = 50) {
    return this.notificationRepository.find({
      where: { recipient_id: userId },
      relations: ['template'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async markAsDelivered(notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (notification) {
      notification.status = NotificationStatus.DELIVERED;
      notification.delivered_at = new Date();
      await this.notificationRepository.save(notification);
    }
  }

  // Convenience methods for common notifications
  async sendSOSAlert(userId: string, location: string, userPhone: string) {
    return this.sendNotification(userId, 'sos_alert', {
      location,
      timestamp: new Date().toISOString(),
      userName: 'Emergency User',
      userPhone,
    });
  }

  async sendReferralAccepted(userId: string, providerName: string, serviceName: string, scheduledDate: string) {
    return this.sendNotification(userId, 'referral_accepted', {
      providerName,
      serviceName,
      scheduledDate,
    });
  }

  async sendDonationThankYou(userId: string, amount: number, campaignName: string) {
    return this.sendNotification(userId, 'donation_received', {
      amount: amount.toFixed(2),
      campaignName,
      donationDate: new Date().toLocaleDateString(),
    });
  }
}