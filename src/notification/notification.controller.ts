import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { TemplateService } from './services/template.service';
import { NotificationGateway } from './gateways/notification.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  CreateNotificationPreferenceDto,
  UpdateNotificationPreferenceDto,
} from './dto/notification-preference.dto';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import {
  TemplateType,
  TemplateCategory,
} from './entities/notification-template.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly templateService: TemplateService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create notification' })
  @ApiResponse({ status: 201, type: Notification })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Post('sos-alert')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send SOS alert' })
  @ApiResponse({ status: 201, description: 'SOS alert sent successfully' })
  sendSOSAlert(
    @Body()
    body: {
      userIds: string[];
      location: string;
      emergencyType: string;
      description: string;
    },
  ) {
    return this.notificationService.sendSOSAlert(
      body.userIds,
      body.location,
      body.emergencyType,
      body.description,
    );
  }

  @Post('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create notification template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  createTemplate(
    @Body()
    body: {
      name: string;
      type: TemplateType;
      category: TemplateCategory;
      templateContent: string;
      subject?: string;
      variables?: string[];
    },
  ) {
    return this.templateService.createTemplate(
      body.name,
      body.type,
      body.category,
      body.templateContent,
      body.subject,
      body.variables,
    );
  }

  @Get('websocket/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get WebSocket status' })
  @ApiResponse({
    status: 200,
    description: 'WebSocket status retrieved successfully',
  })
  getWebSocketStatus() {
    return {
      activeConnections: this.notificationGateway.getActiveConnections(),
    };
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
  createPreferences(
    @Body() createPreferenceDto: CreateNotificationPreferenceDto,
  ) {
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
  updatePreferences(
    @Param('userId') userId: string,
    @Body() updatePreferenceDto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationService.updatePreferences(
      userId,
      updatePreferenceDto,
    );
  }
}
