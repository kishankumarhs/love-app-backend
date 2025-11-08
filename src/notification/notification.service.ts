import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
  NotificationStatus,
  NotificationCategory,
  NotificationPriority,
} from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  CreateNotificationPreferenceDto,
  UpdateNotificationPreferenceDto,
} from './dto/notification-preference.dto';
import { EmailService } from './services/email.service';
import { SMSService } from './services/sms.service';
import { NotificationGateway } from './gateways/notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    private emailService: EmailService,
    private smsService: SMSService,
    private notificationGateway: NotificationGateway,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    const savedNotification =
      await this.notificationRepository.save(notification);

    // Send notification based on type
    await this.sendNotification(savedNotification);

    return savedNotification;
  }

  async sendNotification(notification: Notification): Promise<void> {
    try {
      const user = await this.getUserWithPreferences(notification.userId);

      switch (notification.type) {
        case NotificationType.EMAIL:
          if (user.email) {
            const success = await this.emailService.sendEmail(
              user.email,
              notification.title,
              notification.message,
            );
            await this.updateNotificationStatus(notification.id, success);
          }
          break;

        case NotificationType.SMS:
          if (user.phone) {
            const success = await this.smsService.sendSMS(
              user.phone,
              notification.message,
            );
            await this.updateNotificationStatus(notification.id, success);
          }
          break;

        case NotificationType.PUSH:
          // Send real-time notification via WebSocket
          this.notificationGateway.sendNotificationUpdate(
            notification.userId,
            notification,
          );
          await this.updateNotificationStatus(notification.id, true);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to send notification', error);
      await this.updateNotificationStatus(
        notification.id,
        false,
        error.message,
      );
    }
  }

  async sendSOSAlert(
    userIds: string[],
    location: string,
    emergencyType: string,
    description: string,
  ): Promise<void> {
    const sosData = {
      location,
      emergencyType,
      description,
      timestamp: new Date().toISOString(),
    };

    // Send real-time WebSocket alert
    this.notificationGateway.sendSOSAlert(sosData);

    // Send individual notifications to users
    for (const userId of userIds) {
      const user = await this.getUserWithPreferences(userId);
      const preferences = await this.getPreferences(userId);

      // Create notification record
      const notification = this.notificationRepository.create({
        title: `Emergency Alert - ${location}`,
        message: `${emergencyType}: ${description}`,
        type: NotificationType.PUSH,
        userId,
        category: NotificationCategory.SOS,
        priority: NotificationPriority.URGENT,
      });
      await this.notificationRepository.save(notification);

      // Send email if enabled
      if (preferences.emailNotifications && user.email) {
        await this.emailService.sendSOSAlert(
          user.email,
          location,
          emergencyType,
          description,
        );
      }

      // Send SMS if enabled
      if (preferences.smsNotifications && user.phone) {
        await this.smsService.sendSOSAlert(user.phone, location, emergencyType);
      }
    }
  }

  async sendCampaignUpdate(campaignId: string, data: any): Promise<void> {
    this.notificationGateway.sendCampaignUpdate(campaignId, data);
  }

  private async getUserWithPreferences(userId: string): Promise<any> {
    // This would typically fetch from user repository
    // For now, return a mock user object
    return {
      id: userId,
      email: 'user@example.com',
      phone: '+1234567890',
    };
  }

  private async updateNotificationStatus(
    notificationId: string,
    success: boolean,
    errorMessage?: string,
  ): Promise<void> {
    const status = success
      ? NotificationStatus.SENT
      : NotificationStatus.FAILED;
    const updateData: any = { status };

    if (success) {
      updateData.sentAt = new Date();
    } else if (errorMessage) {
      updateData.failedReason = errorMessage;
    }

    await this.notificationRepository.update(notificationId, updateData);
  }

  async findUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Notification Preferences
  async createPreferences(
    createPreferenceDto: CreateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    const preference = this.preferenceRepository.create(createPreferenceDto);
    return this.preferenceRepository.save(preference);
  }

  async getPreferences(userId: string): Promise<NotificationPreference> {
    const preference = await this.preferenceRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!preference) {
      // Create default preferences if none exist
      return this.createPreferences({ userId });
    }

    return preference;
  }

  async updatePreferences(
    userId: string,
    updatePreferenceDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    const preference = await this.getPreferences(userId);
    await this.preferenceRepository.update(preference.id, updatePreferenceDto);
    return this.getPreferences(userId);
  }
}
