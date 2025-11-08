import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SOS } from './entities/sos.entity';
import { SOSService } from './sos.service';
import { SOSController } from './sos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SOS])],
  controllers: [SOSController],
  providers: [SOSService],
  exports: [SOSService],
})
export class SOSModule {}