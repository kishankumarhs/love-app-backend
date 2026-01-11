import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@ApiTags('Campaigns')
@Controller('Campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) { }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish campaign (Admin only)' })
  publish(@Param('id') id: string) {
    return this.campaignService.publishCampaign(id);
  }

  // Assign employees to campaign
  @Post(':id/employees')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  assignEmployees(
    @Param('id') id: string,
    @Body('employeeIds') employeeIds: string[],
  ) {
    return this.campaignService.assignEmployees(id, employeeIds);
  }

  // Unassign employee from campaign
  @Delete(':id/employees/:employeeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  unassignEmployee(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.campaignService.unassignEmployee(id, employeeId);
  }

  // List employees for a campaign
  @Get(':id/employees')
  listEmployees(@Param('id') id: string) {
    return this.campaignService.listEmployees(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROVIDER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create campaign (Admin & Provider)' })
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.create(createCampaignDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all campaigns (Mobile: Use status=active)',
    description:
      'To list active campaigns for the mobile app, use GET /Campaign?status=active. This returns only campaigns that are published and not expired.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'providerId',
    required: false,
    description: 'Filter by provider ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description:
      'Filter by status (e.g., active, expired, draft). Use "active" to get published and non-expired campaigns.',
  })
  findAll(
    @Query('category') category?: string,
    @Query('providerId') providerId?: string,
    @Query('status') status?: string,
  ) {
    const res = this.campaignService.findAll({ category, providerId, status });
    console.log('findAll called with:', res);
    return res;
  }

  @Get('search')
  search(
    @Query('category') category?: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius?: number,
    @Query('status') status?: string,
  ) {
    return this.campaignService.search({
      category,
      latitude,
      longitude,
      radius,
      status,
    });
  }

  @Get('provider/:providerId')
  findByProvider(@Param('providerId') providerId: string) {
    return this.campaignService.findByProvider(providerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update campaign (Admin only)' })
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete campaign (Admin only)' })
  remove(@Param('id') id: string) {
    return this.campaignService.remove(id);
  }
}
