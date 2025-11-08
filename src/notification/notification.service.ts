import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateNotificationPreferenceDto, UpdateNotificationPreferenceDto } from './dto/notification-preference.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async findUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Notification Preferences
  async createPreferences(createPreferenceDto: CreateNotificationPreferenceDto): Promise<NotificationPreference> {
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

  async updatePreferences(userId: string, updatePreferenceDto: UpdateNotificationPreferenceDto): Promise<NotificationPreference> {
    const preference = await this.getPreferences(userId);
    await this.preferenceRepository.update(preference.id, updatePreferenceDto);
    return this.getPreferences(userId);
  }
}