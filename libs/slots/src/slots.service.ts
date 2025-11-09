import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { SlotPolicy } from './entities/slot-policy.entity';
import { Slot, SlotStatus } from './entities/slot.entity';
import { Service } from '@love-app/common/entities/service.entity';
import { Campaign } from '@love-app/common/entities/campaign.entity';
import { CreateSlotPolicyDto, GetSlotsDto } from './dto/slot.dto';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(SlotPolicy)
    private slotPolicyRepository: Repository<SlotPolicy>,
    @InjectRepository(Slot)
    private slotRepository: Repository<Slot>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) {}

  async createSlotPolicy(createSlotPolicyDto: CreateSlotPolicyDto) {
    // Validate that either service_id or campaign_id is provided
    if (!createSlotPolicyDto.service_id && !createSlotPolicyDto.campaign_id) {
      throw new Error('Either service_id or campaign_id must be provided');
    }

    // Check if policy already exists
    const existingPolicy = await this.slotPolicyRepository.findOne({
      where: {
        service_id: createSlotPolicyDto.service_id,
        campaign_id: createSlotPolicyDto.campaign_id,
      },
    });

    if (existingPolicy) {
      // Update existing policy
      Object.assign(existingPolicy, createSlotPolicyDto);
      return this.slotPolicyRepository.save(existingPolicy);
    }

    // Create new policy
    const policy = this.slotPolicyRepository.create(createSlotPolicyDto);
    return this.slotPolicyRepository.save(policy);
  }

  async getSlots(getSlotsDto: GetSlotsDto) {
    const { date, service_id, campaign_id } = getSlotsDto;

    // Parse date
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Get slot policy
    const policy = await this.slotPolicyRepository.findOne({
      where: {
        service_id: service_id || null,
        campaign_id: campaign_id || null,
      },
    });

    if (!policy) {
      throw new NotFoundException('Slot policy not found');
    }

    // Check if slots already exist for this date
    let slots = await this.slotRepository.find({
      where: {
        service_id: service_id || null,
        campaign_id: campaign_id || null,
        start_time: Between(startDate, endDate),
      },
      order: { start_time: 'ASC' },
    });

    // If no slots exist, generate them
    if (slots.length === 0) {
      slots = await this.generateSlotsForDate(policy, startDate);
    }

    return slots;
  }

  private async generateSlotsForDate(
    policy: SlotPolicy,
    date: Date,
  ): Promise<Slot[]> {
    const dayOfWeek = date.toLocaleDateString('en-US', {
      weekday: 'long',
    }).toLowerCase();
    const operatingHours = policy.operating_hours[dayOfWeek];

    if (!operatingHours) {
      return []; // No operating hours for this day
    }

    const slots: Slot[] = [];
    const [startHour, startMinute] = operatingHours.start
      .split(':')
      .map(Number);
    const [endHour, endMinute] = operatingHours.end.split(':').map(Number);

    const currentSlot = new Date(date);
    currentSlot.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(slotEnd.getMinutes() + policy.slot_size);

      if (slotEnd <= endTime) {
        const slot = this.slotRepository.create({
          service_id: policy.service_id,
          campaign_id: policy.campaign_id,
          start_time: new Date(currentSlot),
          end_time: new Date(slotEnd),
          current_bookings: 0,
          max_capacity: policy.max_per_slot,
          status: SlotStatus.AVAILABLE,
        });

        slots.push(slot);
      }

      currentSlot.setMinutes(currentSlot.getMinutes() + policy.slot_size);
    }

    // Save all slots
    if (slots.length > 0) {
      await this.slotRepository.save(slots);
    }

    return slots;
  }

  async bookSlot(slotId: string): Promise<Slot> {
    const slot = await this.slotRepository.findOne({ where: { id: slotId } });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new Error('Slot is not available');
    }

    if (slot.current_bookings >= slot.max_capacity) {
      throw new Error('Slot is fully booked');
    }

    slot.current_bookings += 1;
    if (slot.current_bookings >= slot.max_capacity) {
      slot.status = SlotStatus.BOOKED;
    }

    return this.slotRepository.save(slot);
  }
}
