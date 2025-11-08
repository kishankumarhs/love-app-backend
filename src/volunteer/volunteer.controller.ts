import { Controller, Get, Post, Body, Param, UseGuards, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VolunteerService } from './volunteer.service';
import { CreateVolunteerDto, UpdateVolunteerDto } from './dto/create-volunteer.dto';
import { Volunteer } from './entities/volunteer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Volunteers')
@Controller('volunteers')
export class VolunteerController {
  constructor(private readonly volunteerService: VolunteerService) {}

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