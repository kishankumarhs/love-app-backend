import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard, Roles } from '@love-app/auth';
import { UserRole } from '@love-app/common/entities/user.entity';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.PROVIDER_ADMIN)
  @Post('send')
  @ApiOperation({ summary: 'Send notification to user' })
  @ApiResponse({ status: 201, description: 'Notification sent' })
  async sendNotification(@Body() body: any) {
    const { recipientId, templateKey, variables, type } = body;
    return this.notificationsService.sendNotification(recipientId, templateKey, variables, type);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('bulk')
  @ApiOperation({ summary: 'Send bulk notifications' })
  @ApiResponse({ status: 201, description: 'Bulk notifications sent' })
  async sendBulkNotification(@Body() body: any) {
    const { recipientIds, templateKey, variables, type } = body;
    return this.notificationsService.sendBulkNotification(recipientIds, templateKey, variables, type);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('history/:userId')
  @ApiOperation({ summary: 'Get notification history for user' })
  @ApiResponse({ status: 200, description: 'Notification history' })
  async getNotificationHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.getNotificationHistory(userId, limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/delivered')
  @ApiOperation({ summary: 'Mark notification as delivered' })
  @ApiResponse({ status: 200, description: 'Notification marked as delivered' })
  async markAsDelivered(@Param('id') notificationId: string) {
    return this.notificationsService.markAsDelivered(notificationId);
  }
}