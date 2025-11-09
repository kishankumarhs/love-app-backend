import { Controller, Post, Get, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { CreateProviderDto, SearchProvidersDto, AddEmployeeDto } from './dto/provider.dto';
import { JwtAuthGuard, Roles } from '@love-app/auth';
import { AllowGuest } from '@love-app/auth';
import { UserRole } from '@love-app/common/entities/user.entity';

@ApiTags('Providers')
@Controller('providers')
export class ProvidersController {
  constructor(private providersService: ProvidersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Register as provider' })
  @ApiResponse({ status: 201, description: 'Provider registered successfully' })
  async create(@Body() createProviderDto: CreateProviderDto, @Req() req) {
    return this.providersService.create(createProviderDto, req.user.id);
  }

  @AllowGuest()
  @Get('search')
  @ApiOperation({ summary: 'Search providers' })
  @ApiResponse({ status: 200, description: 'Providers found' })
  async search(@Query() searchDto: SearchProvidersDto) {
    return this.providersService.search(searchDto);
  }

  @AllowGuest()
  @Get(':id')
  @ApiOperation({ summary: 'Get provider details' })
  @ApiResponse({ status: 200, description: 'Provider details' })
  async findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.PROVIDER_ADMIN)
  @Post(':id/employees')
  @ApiOperation({ summary: 'Add employee to organization' })
  @ApiResponse({ status: 201, description: 'Employee added successfully' })
  async addEmployee(
    @Param('id') orgId: string,
    @Body() addEmployeeDto: AddEmployeeDto,
    @Req() req,
  ) {
    return this.providersService.addEmployee(orgId, addEmployeeDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/employees')
  @ApiOperation({ summary: 'Get organization employees' })
  @ApiResponse({ status: 200, description: 'Employees list' })
  async getEmployees(@Param('id') orgId: string, @Req() req) {
    return this.providersService.getEmployees(orgId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get provider dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics' })
  async getDashboardMetrics(@Param('id') orgId: string, @Req() req) {
    return this.providersService.getDashboardMetrics(orgId, req.user.id);
  }
}