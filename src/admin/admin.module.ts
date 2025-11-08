import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AnalyticsService } from './services/analytics.service';
import { AdminAnalytics } from './entities/admin-analytics.entity';
import { AdminAction } from './entities/admin-action.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { User } from '../user/entities/user.entity';
import { Provider } from '../provider/entities/provider.entity';
import { Campaign } from '../campaign/entities/campaign.entity';
import { Donation } from '../donations/entities/donation.entity';
import { Volunteer } from '../volunteer/entities/volunteer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminAnalytics,
      AdminAction,
      SystemSetting,
      User,
      Provider,
      Campaign,
      Donation,
      Volunteer,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AnalyticsService],
  exports: [AdminService, AnalyticsService],
})
export class AdminModule {}