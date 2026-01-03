import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SOSTicket } from './entities/sos-ticket.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { CreateSOSTicketDto } from './dto/create-sos-ticket.dto';
import { UpdateSOSTicketDto } from './dto/update-sos-ticket.dto';
import { EmergencyCallService } from './services/emergency-call.service';
import { RequestsService } from '../requests/requests.service';

@Injectable()
export class SOSService {
  private readonly logger = new Logger(SOSService.name);

  constructor(
    @InjectRepository(SOSTicket)
    private sosTicketRepository: Repository<SOSTicket>,
    @InjectRepository(EmergencyContact)
    private emergencyContactRepository: Repository<EmergencyContact>,
    private emergencyCallService: EmergencyCallService,
    private requestsService: RequestsService,
  ) { }

  async createSOSTicket(
    createSOSTicketDto: CreateSOSTicketDto,
  ): Promise<SOSTicket> {
    const ticket = this.sosTicketRepository.create({
      ...createSOSTicketDto,
      priority: this.determinePriority(createSOSTicketDto.emergencyType),
    });

    const savedTicket = await this.sosTicketRepository.save(ticket);

    // Create a corresponding Request entity to track this service interaction
    if (savedTicket.userId) {
      try {
        await this.requestsService.createRequest({
          userId: savedTicket.userId,
          title: `SOS: ${createSOSTicketDto.emergencyType.toUpperCase()}`,
          description: createSOSTicketDto.description || 'Emergency SOS Alert',
          category: 'sos',
          urgency: savedTicket.priority || 'high',
          latitude: createSOSTicketDto.latitude,
          longitude: createSOSTicketDto.longitude,
          address: createSOSTicketDto.address,
        });
      } catch (error) {
        this.logger.error(`Failed to create Request for SOS ticket ${savedTicket.id}`, error.stack);
        // Do not fail the SOS creation if Request creation fails, catching error to proceed
      }
    }

    // Handle emergency call if required
    if (createSOSTicketDto.requiresEmergencyCall) {
      await this.handleEmergencyCall(savedTicket);
    }

    this.logger.log(`SOS ticket created: ${savedTicket.id}`);
    return savedTicket;
  }

  async findAll(filters?: {
    status?: string;
    userId?: string;
    emergencyType?: string;
  }): Promise<SOSTicket[]> {
    const query = this.sosTicketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user');

    if (filters?.status) {
      query.andWhere('ticket.status = :status', { status: filters.status });
    }

    if (filters?.userId) {
      query.andWhere('ticket.userId = :userId', { userId: filters.userId });
    }

    if (filters?.emergencyType) {
      query.andWhere('ticket.emergencyType = :emergencyType', {
        emergencyType: filters.emergencyType,
      });
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

  async updateTicket(
    id: string,
    updateSOSTicketDto: UpdateSOSTicketDto,
  ): Promise<SOSTicket> {
    await this.findOne(id);

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

  private async handleEmergencyCall(sosTicket: SOSTicket): Promise<void> {
    try {
      const emergencyNumber =
        await this.emergencyCallService.getLocalEmergencyNumber(
          sosTicket.address,
        );

      const callRequest = {
        phoneNumber: emergencyNumber,
        emergencyType: sosTicket.emergencyType,
        location: sosTicket.address,
        description: sosTicket.description,
        callerInfo: {
          name:
            sosTicket.guestName ||
            (sosTicket.user
              ? `${sosTicket.user.firstName} ${sosTicket.user.lastName}`.trim()
              : ''),
          phone: sosTicket.guestPhone || sosTicket.user?.phone,
        },
      };

      const response =
        await this.emergencyCallService.makeEmergencyCall(callRequest);

      await this.sosTicketRepository.update(sosTicket.id, {
        isEmergencyCallMade: true,
        emergencyCallId: response.callId,
        emergencyCallResponse: response.message,
      });

      this.logger.log(
        `Emergency call made for ticket ${sosTicket.id}: ${response.callId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to make emergency call for ticket ${sosTicket.id}: ${error.message}`,
      );
    }
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radius: number = 5,
  ): Promise<SOSTicket[]> {
    const query = this.sosTicketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .where('ticket.status IN (:...statuses)', {
        statuses: ['open', 'in_progress'],
      })
      .andWhere(
        `(
          6371 * acos(
            cos(radians(:latitude)) * cos(radians(ticket.latitude)) *
            cos(radians(ticket.longitude) - radians(:longitude)) +
            sin(radians(:latitude)) * sin(radians(ticket.latitude))
          )
        ) <= :radius`,
        { latitude, longitude, radius },
      )
      .orderBy('ticket.createdAt', 'DESC');

    return query.getMany();
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
