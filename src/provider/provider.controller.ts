import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProviderService } from './provider.service';
import { CreateProvider } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Provider } from './entities/provider.entity';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@ApiTags('Providers')
@Controller('providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) { }

  // Employee CRUD
  @ApiOperation({ summary: 'Create employee' })
  @ApiResponse({ status: 201, type: Employee })
  @Post('employees') // Removed :providerId
  @UseGuards(JwtAuthGuard) // Added guard to ensure user/provider logic works
  createEmployee(
    @Request() req,
    @Body() dto: CreateEmployeeDto,
  ) {
    // Assuming req.user is populated by FirebaseAuthMiddleware and has provider
    const providerId = req.user.provider?.id;
    if (!providerId) {
      // Handle case where user is not a provider or provider not loaded
      throw new BadRequestException('User is not a provider');
      // Need to import BadRequestException
    }
    return this.providerService.createEmployee({ ...dto, providerId });
  }

  @ApiOperation({ summary: 'Get all employees (optionally by provider)' })
  @ApiResponse({ status: 200, type: [Employee] })
  @Get('employees')
  @UseGuards(JwtAuthGuard)
  findAllEmployees(@Request() req, @Query('providerId') providerId?: string) {
    const user = req.user;
    // If user is a provider, force their own employees
    if (user?.role === 'provider' && user.provider) {
      return this.providerService.findAllEmployees(user.provider.id);
    }
    // Otherwise allow filtering by query param (e.g. for admins)
    return this.providerService.findAllEmployees(providerId);
  }

  @ApiOperation({ summary: 'Get employee by id' })
  @ApiResponse({ status: 200, type: Employee })
  @Get('employees/:id')
  findEmployeeById(@Param('id') id: string) {
    return this.providerService.findEmployeeById(id);
  }

  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, type: Employee })
  @Patch('employees/:id')
  updateEmployee(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.providerService.updateEmployee(id, dto);
  }

  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({ status: 200, description: 'Employee deleted' })
  @Delete('employees/:id')
  removeEmployee(@Param('id') id: string) {
    return this.providerService.removeEmployee(id);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('capacity') capacity?: number,
  ) {
    return this.providerService.findAll({ category, location, capacity });
  }

  /**
   * Mobile-friendly service discovery API
   * Used for Map and List views in the mobile app.
   */
  @Get('discovery')
  @ApiOperation({ summary: 'Discover services (Mobile Map/List)' })
  @ApiResponse({ status: 200, description: 'List of providers with pagination' })
  discovery(
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius?: number,
    @Query('category') category?: string,
    @Query('open_now') open_now?: boolean,
    @Query('capacity_available') capacity_available?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.providerService.discovery({
      latitude,
      longitude,
      radius,
      category,
      open_now,
      capacity_available,
      page,
      limit,
    });
  }



  /**
   * Mobile-friendly service detail
   * Includes approved reviews.
   */
  @Get('details/:id')
  @ApiOperation({ summary: 'Get provider details with approved reviews' })
  @ApiResponse({ status: 200, description: 'Provider details + approved reviews' })
  getMobileDetail(@Param('id') id: string) {
    return this.providerService.getMobileDetail(id);
  }

  @Get('search')
  search(
    @Query('q') query?: string,
    @Query('type') type?: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius?: number,
  ) {
    return this.providerService.search({
      query,
      type,
      latitude,
      longitude,
      radius,
    });
  }

  @ApiOperation({ summary: 'Register a new provider' })
  @ApiResponse({ status: 201, type: Provider })
  @ApiBody({ type: CreateProvider })
  @Post('register')
  register(@Body() createProviderDto: CreateProvider) {
    return this.providerService.create(createProviderDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providerService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    return this.providerService.update(id, updateProviderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.providerService.remove(id);
  }
}
