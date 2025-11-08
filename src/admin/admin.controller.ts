import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { AdminService } from './admin.service';
import { AdminFiltersDto, AnalyticsFiltersDto } from './dto/admin-filters.dto';
import {
  UserManagementDto,
  ProviderManagementDto,
} from './dto/admin-action.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard & Analytics
  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard metrics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard metrics retrieved successfully',
  })
  getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('analytics')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get analytics data with filters' })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully',
  })
  getAnalytics(@Query() filters: AnalyticsFiltersDto) {
    return this.adminService.getAnalytics(filters);
  }

  // User Management
  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get users with advanced filters' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  getUsers(@Query() filters: AdminFiltersDto) {
    return this.adminService.getUsers(filters);
  }

  @Post('users/manage')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Manage user (suspend/activate/delete)' })
  @ApiResponse({ status: 200, description: 'User managed successfully' })
  manageUser(@Body() dto: UserManagementDto, @Request() req) {
    return this.adminService.manageUser(dto, req.user.id);
  }

  // Provider Management
  @Get('providers')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get providers with advanced filters' })
  @ApiResponse({ status: 200, description: 'Providers retrieved successfully' })
  getProviders(@Query() filters: AdminFiltersDto) {
    return this.adminService.getProviders(filters);
  }

  @Post('providers/manage')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Manage provider (approve/reject/suspend)' })
  @ApiResponse({ status: 200, description: 'Provider managed successfully' })
  manageProvider(@Body() dto: ProviderManagementDto, @Request() req) {
    return this.adminService.manageProvider(dto, req.user.id);
  }

  // Campaign Management
  @Get('campaigns')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get campaigns with advanced filters' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  getCampaigns(@Query() filters: AdminFiltersDto) {
    return this.adminService.getCampaigns(filters);
  }

  // Donation Management
  @Get('donations')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get donations with advanced filters' })
  @ApiResponse({ status: 200, description: 'Donations retrieved successfully' })
  getDonations(@Query() filters: AdminFiltersDto) {
    return this.adminService.getDonations(filters);
  }

  // Volunteer Management
  @Get('volunteers')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get volunteers with advanced filters' })
  @ApiResponse({
    status: 200,
    description: 'Volunteers retrieved successfully',
  })
  getVolunteers(@Query() filters: AdminFiltersDto) {
    return this.adminService.getVolunteers(filters);
  }

  // System Settings
  @Get('settings')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get system settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put('settings/:key')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update system setting' })
  @ApiResponse({ status: 200, description: 'Setting updated successfully' })
  updateSetting(
    @Param('key') key: string,
    @Body() body: { value: string },
    @Request() req,
  ) {
    return this.adminService.updateSetting(key, body.value, req.user.id);
  }

  // Admin Actions Log
  @Get('actions')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get admin actions log' })
  @ApiResponse({
    status: 200,
    description: 'Admin actions retrieved successfully',
  })
  getAdminActions(@Query() filters: AdminFiltersDto) {
    return this.adminService.getAdminActions(filters);
  }
}
