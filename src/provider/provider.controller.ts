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
  constructor(private readonly providerService: ProviderService) {}

  // Employee CRUD
  @ApiOperation({ summary: 'Create employee' })
  @ApiResponse({ status: 201, type: Employee })
  @Post(':providerId/employees')
  createEmployee(
    @Param('providerId') providerId: string,
    @Body() dto: CreateEmployeeDto,
  ) {
    return this.providerService.createEmployee({ ...dto, providerId });
  }

  @ApiOperation({ summary: 'Get all employees (optionally by provider)' })
  @ApiResponse({ status: 200, type: [Employee] })
  @Get('employees')
  findAllEmployees(@Query('providerId') providerId?: string) {
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
