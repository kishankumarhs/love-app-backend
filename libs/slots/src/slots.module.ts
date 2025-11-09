import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SlotPolicy } from './entities/slot-policy.entity';
import { Slot } from './entities/slot.entity';
import { Service } from '@love-app/common/entities/service.entity';
import { Campaign } from '@love-app/common/entities/campaign.entity';

import { SlotsService } from './slots.service';
import { SlotsController } from './slots.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SlotPolicy, Slot, Service, Campaign])],
  providers: [SlotsService],
  controllers: [SlotsController],
  exports: [SlotsService],
})
export class SlotsModule {}
