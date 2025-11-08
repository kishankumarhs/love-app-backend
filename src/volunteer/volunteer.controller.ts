import { Controller, Get, Post, Body, Param, UseGuards, Put, Delete, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VolunteerService } from './volunteer.service';
import { VoucherService } from './services/voucher.service';
import { CreateVolunteerDto, UpdateVolunteerDto } from './dto/create-volunteer.dto';
import { CreateVolunteerApplicationDto } from './dto/create-volunteer-application.dto';
import { CreateWifiVoucherDto } from './dto/create-wifi-voucher.dto';
import { ActivateVoucherDto } from './dto/activate-voucher.dto';
import { Volunteer } from './entities/volunteer.entity';
import { ApplicationStatus } from './entities/volunteer-application.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Volunteers')
@Controller('volunteers')
export class VolunteerController {
  constructor(
    private readonly volunteerService: VolunteerService,
    private readonly voucherService: VoucherService,
  ) {}

  @Post('applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit volunteer application' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  submitApplication(@Request() req, @Body() applicationDto: CreateVolunteerApplicationDto) {
    return this.volunteerService.submitApplication(req.user.id, applicationDto);
  }

  @Post('applications/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve volunteer application' })
  @ApiResponse({ status: 200, description: 'Application approved successfully' })
  approveApplication(@Param('id') id: string, @Request() req) {
    return this.volunteerService.approveApplication(id, req.user.id);
  }

  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get volunteer applications' })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  getApplications(@Query('status') status?: ApplicationStatus) {
    return this.volunteerService.getApplications(status);
  }

  @Get('applications/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user application' })
  @ApiResponse({ status: 200, description: 'Application retrieved successfully' })
  getMyApplication(@Request() req) {
    return this.volunteerService.getUserApplication(req.user.id);
  }

  @Post('vouchers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Wi-Fi voucher' })
  @ApiResponse({ status: 201, description: 'Voucher created successfully' })
  createVoucher(@Body() createVoucherDto: CreateWifiVoucherDto) {
    return this.voucherService.createVoucher(createVoucherDto);
  }

  @Post('vouchers/activate')
  @ApiOperation({ summary: 'Activate Wi-Fi voucher' })
  @ApiResponse({ status: 200, description: 'Voucher activated successfully' })
  activateVoucher(@Body() activateVoucherDto: ActivateVoucherDto) {
    return this.voucherService.activateVoucher(activateVoucherDto);
  }

  @Get('vouchers/code/:code')
  @ApiOperation({ summary: 'Get voucher by code' })
  @ApiResponse({ status: 200, description: 'Voucher retrieved successfully' })
  getVoucherByCode(@Param('code') code: string) {
    return this.voucherService.getVoucherByCode(code);
  }

  @Get('vouchers/provider/:providerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get vouchers by provider' })
  @ApiResponse({ status: 200, description: 'Vouchers retrieved successfully' })
  getVouchersByProvider(@Param('providerId') providerId: string) {
    return this.voucherService.getVouchersByProvider(providerId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create volunteer profile' })
  @ApiResponse({ status: 201, type: Volunteer })
  create(@Body() createVolunteerDto: CreateVolunteerDto) {
    return this.volunteerService.create(createVolunteerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all volunteers' })
  @ApiResponse({ status: 200, description: 'List of volunteers with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.volunteerService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get volunteer by ID' })
  @ApiResponse({ status: 200, type: Volunteer })
  findOne(@Param('id') id: string) {
    return this.volunteerService.findOne(id);
  }

  @Get(':id/assignments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get volunteer assignments' })
  @ApiResponse({ status: 200, description: 'Assignments retrieved successfully' })
  getAssignments(@Param('id') id: string) {
    return this.volunteerService.getAssignments(id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get volunteer by user ID' })
  @ApiResponse({ status: 200, type: Volunteer })
  findByUserId(@Param('userId') userId: string) {
    return this.volunteerService.findByUserId(userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update volunteer profile' })
  @ApiResponse({ status: 200, type: Volunteer })
  update(@Param('id') id: string, @Body() updateVolunteerDto: UpdateVolunteerDto) {
    return this.volunteerService.update(id, updateVolunteerDto);
  }

  @Put('user/:userId/preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update volunteer preferences' })
  @ApiResponse({ status: 200, type: Volunteer })
  updatePreferences(@Param('userId') userId: string, @Body() preferences: any) {
    return this.volunteerService.updatePreferences(userId, preferences);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete volunteer profile' })
  @ApiResponse({ status: 200, description: 'Volunteer deleted successfully' })
  remove(@Param('id') id: string) {
    return this.volunteerService.remove(id);
  }
}