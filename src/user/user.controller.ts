import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CreateUserProfileDto,
  UpdateUserProfileDto,
} from './dto/user-profile.dto';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto/feedback.dto';
import { User, UserRole } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Feedback } from './entities/feedback.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: User })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'List of users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.userService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: User })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: User })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // Profile Management
  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create user profile' })
  @ApiResponse({ status: 201, type: UserProfile })
  createProfile(@Body() createProfileDto: CreateUserProfileDto) {
    return this.userService.createProfile(createProfileDto);
  }

  // Profile Management

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserProfile })
  getCurrentProfile(@Request() req) {
    return this.userService.getProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, type: UserProfile })
  updateCurrentProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ) {
    return this.userService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('nearby')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get nearby users' })
  @ApiResponse({ status: 200, description: 'List of nearby users' })
  getNearbyUsers(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 10,
  ) {
    return this.userService.findNearby(latitude, longitude, radius);
  }

  @Get(':userId/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, type: UserProfile })
  getProfile(@Param('userId') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Put(':userId/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, type: UserProfile })
  updateProfile(
    @Param('userId') userId: string,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ) {
    return this.userService.updateProfile(userId, updateProfileDto);
  }

  // Feedback Management
  @Post('feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit feedback' })
  @ApiResponse({ status: 201, type: Feedback })
  createFeedback(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.userService.createFeedback(createFeedbackDto);
  }

  @Get('feedback/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all feedback (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of feedback with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getFeedback(@Query() paginationDto: PaginationDto) {
    return this.userService.getFeedback(paginationDto);
  }

  @Put('feedback/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update feedback status (Admin only)' })
  @ApiResponse({ status: 200, type: Feedback })
  updateFeedback(
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.userService.updateFeedback(id, updateFeedbackDto);
  }
}
