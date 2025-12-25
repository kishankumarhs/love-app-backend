import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SOSService } from './sos.service';
import { CreateSOSTicketDto } from './dto/create-sos-ticket.dto';
import { UpdateSOSTicketDto } from './dto/update-sos-ticket.dto';
import { GuestSOSDto } from './dto/guest-sos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sos')
export class SOSController {
  constructor(private readonly sosService: SOSService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createSOSTicketDto: CreateSOSTicketDto, @Request() req) {
    return this.sosService.createSOSTicket({
      ...createSOSTicketDto,
      userId: req.user.id,
    });
  }

  @Get('my-alerts')
  @UseGuards(JwtAuthGuard)
  getMyAlerts(@Request() req) {
    return this.sosService.findAll({ userId: req.user.id });
  }

  @Get('nearby')
  @UseGuards(JwtAuthGuard)
  getNearbyAlerts(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 5,
  ) {
    return this.sosService.findNearby(latitude, longitude, radius);
  }

  @Post('ticket')
  createTicket(@Body() createSOSTicketDto: CreateSOSTicketDto) {
    return this.sosService.createSOSTicket(createSOSTicketDto);
  }

  @Get('tickets')
  findAllTickets(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('emergencyType') emergencyType?: string,
  ) {
    return this.sosService.findAll({ status, userId, emergencyType });
  }

  @Get('tickets/guest/:phone')
  getGuestTickets(@Param('phone') phone: string) {
    return this.sosService.getGuestTickets(phone);
  }

  @Get('tickets/:id')
  findOneTicket(@Param('id') id: string) {
    return this.sosService.findOne(id);
  }

  @Patch('tickets/:id')
  updateTicket(
    @Param('id') id: string,
    @Body() updateSOSTicketDto: UpdateSOSTicketDto,
  ) {
    return this.sosService.updateTicket(id, updateSOSTicketDto);
  }

  @Get('emergency-contacts')
  getEmergencyContacts() {
    return this.sosService.getEmergencyContacts();
  }

  @Post('emergency-call/:ticketId')
  async triggerEmergencyCall(@Param('ticketId') ticketId: string) {
    await this.sosService.findOne(ticketId);
    // Emergency call logic is handled in service
    return { message: 'Emergency call initiated', ticketId };
  }

  @Post('guest/ticket')
  createGuestTicket(@Body() guestSOSDto: GuestSOSDto) {
    const createDto: CreateSOSTicketDto = {
      guestPhone: guestSOSDto.guestPhone,
      guestName: guestSOSDto.guestName,
      emergencyType: guestSOSDto.emergencyType,
      description: guestSOSDto.description,
      latitude: guestSOSDto.latitude,
      longitude: guestSOSDto.longitude,
      address: guestSOSDto.address,
      requiresEmergencyCall: guestSOSDto.requiresEmergencyCall,
    };
    return this.sosService.createSOSTicket(createDto);
  }
}
