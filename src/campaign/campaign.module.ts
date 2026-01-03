import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { Campaign } from './entities/campaign.entity';
import { Employee } from '../provider/entities/employee.entity';
import { Provider } from '../provider/entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, Employee, Provider])],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
