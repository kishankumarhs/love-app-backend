import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  @Get()
  async getNotifications() {
    return { success: true, notifications: [] };
  }

  @Post()
  async sendNotification(@Body() data: any) {
    return { success: true, message: 'Notification sent' };
  }
}
