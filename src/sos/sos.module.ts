import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SOSTicket } from './entities/sos-ticket.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { SOSService } from './sos.service';
import { SOSController } from './sos.controller';
import { EmergencyCallService } from './services/emergency-call.service';

@Module({
  imports: [TypeOrmModule.forFeature([SOSTicket, EmergencyContact])],
  controllers: [SOSController],
  providers: [SOSService, EmergencyCallService],
  exports: [SOSService, EmergencyCallService],
})
export class SOSModule {}
