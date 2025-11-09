import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConnectivityService } from './connectivity.service';
import { CreateWifiTokenDto, ValidateTokenDto } from './dto/connectivity.dto';
import { JwtAuthGuard, Roles } from '@love-app/auth';
import { UserRole } from '@love-app/common/entities/user.entity';
import { Public } from '@love-app/auth';

@ApiTags('Connectivity')
@Controller('connectivity')
export class ConnectivityController {
  constructor(private connectivityService: ConnectivityService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_STAFF)
  @Post('token')
  @ApiOperation({ summary: 'Generate Wi-Fi access token' })
  @ApiResponse({ status: 201, description: 'Token generated successfully' })
  async createToken(@Body() createWifiTokenDto: CreateWifiTokenDto) {
    return this.connectivityService.createToken(createWifiTokenDto);
  }

  @Public()
  @Post('validate')
  @ApiOperation({ summary: 'Validate Wi-Fi access token' })
  @ApiResponse({ status: 200, description: 'Token validation result' })
  async validateToken(@Body() validateTokenDto: ValidateTokenDto) {
    return this.connectivityService.validateToken(validateTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.PROVIDER_ADMIN)
  @Get('stats')
  @ApiOperation({ summary: 'Get token usage statistics' })
  @ApiResponse({ status: 200, description: 'Token statistics' })
  async getTokenStats() {
    return this.connectivityService.getTokenStats();
  }
}