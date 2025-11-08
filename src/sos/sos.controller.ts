import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SOSService } from './sos.service';
import { CreateSOSDto } from './dto/create-sos.dto';
import { SOS } from './entities/sos.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GuestGuard } from '../auth/guards/guest.guard';
import { AllowGuest } from '../auth/decorators/allow-guest.decorator';

@ApiTags('SOS')
@Controller('sos')
export class SOSController {
  constructor(private readonly sosService: SOSService) {}

  @Post()
  @AllowGuest()
  @UseGuards(GuestGuard)
  @ApiOperation({ summary: 'Create SOS call - Guest allowed for emergencies' })
  @ApiResponse({ status: 201, type: SOS })
  create(@Body() createSOSDto: CreateSOSDto) {
    return this.sosService.create(createSOSDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all SOS calls' })
  @ApiResponse({ status: 200, type: [SOS] })
  findAll() {
    return this.sosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SOS call by ID' })
  @ApiResponse({ status: 200, type: SOS })
  findOne(@Param('id') id: string) {
    return this.sosService.findOne(id);
  }
}