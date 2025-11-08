import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SOSTicket } from './entities/sos-ticket.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { CreateSOSTicketDto } from './dto/create-sos-ticket.dto';
import { UpdateSOSTicketDto } from './dto/update-sos-ticket.dto';
import { EmergencyCallService } from './services/emergency-call.service';

@Injectable()
export class SOSService {
  private readonly logger = new Logger(SOSService.name);

  constructor(
    @InjectRepository(SOSTicket)
    private sosTicketRepository: Repository<SOSTicket>,
    @InjectRepository(EmergencyContact)
    private emergencyContactRepository: Repository<EmergencyContact>,
    private emergencyCallService: EmergencyCallService,
  ) {}

  async createSOSTicket(createSOSTicketDto: CreateSOSTicketDto): Promise<SOSTicket> {
    const ticket = this.sosTicketRepository.create({
      ...createSOSTicketDto,
      priority: this.determinePriority(createSOSTicketDto.emergencyType),
    });

    const savedTicket = await this.sosTicketRepository.save(ticket);

    // Handle emergency call if required
    if (createSOSTicketDto.requiresEmergencyCall) {
      await this.handleEmergencyCall(savedTicket);
    }

    this.logger.log(`SOS ticket created: ${savedTicket.id}`);
    return savedTicket;
  }

  async findAll(filters?: { status?: string; userId?: string; emergencyType?: string }): Promise<SOSTicket[]> {
    const query = this.sosTicketRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user');

    if (filters?.status) {
      query.andWhere('ticket.status = :status', { status: filters.status });
    }

    if (filters?.userId) {
      query.andWhere('ticket.userId = :userId', { userId: filters.userId });
    }

    if (filters?.emergencyType) {
      query.andWhere('ticket.emergencyType = :emergencyType', { emergencyType: filters.emergencyType });
    }

    return query.orderBy('ticket.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<SOSTicket> {
    const ticket = await this.sosTicketRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!ticket) {
      throw new NotFoundException('SOS ticket not found');
    }

    return ticket;
  }

  async updateTicket(id: string, updateSOSTicketDto: UpdateSOSTicketDto): Promise<SOSTicket> {
    const ticket = await this.findOne(id);
    
    if (updateSOSTicketDto.status === 'resolved') {
      updateSOSTicketDto['resolvedAt'] = new Date();
    }

    await this.sosTicketRepository.update(id, updateSOSTicketDto);
    return this.findOne(id);
  }

  async getGuestTickets(guestPhone: string): Promise<SOSTicket[]> {
    return this.sosTicketRepository.find({
      where: { guestPhone },
      order: { createdAt: 'DESC' },
    });
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return this.emergencyContactRepository.find({
      where: { isActive: true },
      order: { priority: 'ASC' },
    });
  }

  private async handleEmergencyCall(ticket: SOSTicket): Promise<void> {
    try {
      const emergencyNumber = await this.emergencyCallService.getLocalEmergencyNumber(ticket.address);
      
      const callRequest = {
        phoneNumber: emergencyNumber,
        emergencyType: ticket.emergencyType,
        location: ticket.address,
        description: ticket.description,
        callerInfo: {
          name: ticket.guestName || ticket.user?.name,
          phone: ticket.guestPhone || ticket.user?.phone,
        },
      };

      const response = await this.emergencyCallService.makeEmergencyCall(callRequest);
      
      await this.sosTicketRepository.update(ticket.id, {
        isEmergencyCallMade: true,
        emergencyCallId: response.callId,
        emergencyCallResponse: response.message,
      });

      this.logger.log(`Emergency call made for ticket ${ticket.id}: ${response.callId}`);
    } catch (error) {
      this.logger.error(`Failed to make emergency call for ticket ${ticket.id}: ${error.message}`);
    }
  }

  private determinePriority(emergencyType: string): string {
    const highPriorityTypes = ['medical', 'fire', 'violence', 'accident'];
    const mediumPriorityTypes = ['theft', 'harassment', 'mental_health'];
    
    if (highPriorityTypes.includes(emergencyType.toLowerCase())) {
      return 'high';
    } else if (mediumPriorityTypes.includes(emergencyType.toLowerCase())) {
      return 'medium';
    }
    return 'low';
  }
}