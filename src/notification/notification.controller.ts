import { Controller, Get, Post, Body, Param, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateNotificationPreferenceDto, UpdateNotificationPreferenceDto } from './dto/notification-preference.dto';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create notification' })
  @ApiResponse({ status: 201, type: Notification })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, type: [Notification] })
  findUserNotifications(@Param('userId') userId: string) {
    return this.notificationService.findUserNotifications(userId);
  }

  // Notification Preferences
  @Post('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create notification preferences' })
  @ApiResponse({ status: 201, type: NotificationPreference })
  createPreferences(@Body() createPreferenceDto: CreateNotificationPreferenceDto) {
    return this.notificationService.createPreferences(createPreferenceDto);
  }

  @Get('preferences/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiResponse({ status: 200, type: NotificationPreference })
  getPreferences(@Param('userId') userId: string) {
    return this.notificationService.getPreferences(userId);
  }

  @Put('preferences/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, type: NotificationPreference })
  updatePreferences(@Param('userId') userId: string, @Body() updatePreferenceDto: UpdateNotificationPreferenceDto) {
    return this.notificationService.updatePreferences(userId, updatePreferenceDto);
  }
}