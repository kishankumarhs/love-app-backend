import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Volunteer } from './entities/volunteer.entity';
import { VolunteerApplication } from './entities/volunteer-application.entity';
import { VolunteerAssignment } from './entities/volunteer-assignment.entity';
import { WifiVoucher } from './entities/wifi-voucher.entity';
import { VoucherUsageLog } from './entities/voucher-usage-log.entity';
import { VolunteerService } from './volunteer.service';
import { VoucherService } from './services/voucher.service';
import { VolunteerController } from './volunteer.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Volunteer,
      VolunteerApplication,
      VolunteerAssignment,
      WifiVoucher,
      VoucherUsageLog,
    ]),
  ],
  controllers: [VolunteerController],
  providers: [VolunteerService, VoucherService],
  exports: [VolunteerService, VoucherService],
})
export class VolunteerModule {}
