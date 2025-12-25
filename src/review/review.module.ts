import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ModerationQueue } from './entities/moderation-queue.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { Report } from './entities/report.entity';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ModerationService } from './services/moderation.service';
import { AuditService } from './services/audit.service';
import { ReportService } from './services/report.service';
import { User } from '../user/entities/user.entity';
import { Provider } from '../provider/entities/provider.entity';
import { Campaign } from '../campaign/entities/campaign.entity';
import { Donation } from '../donations/entities/donation.entity';
import { Volunteer } from '../volunteer/entities/volunteer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      ModerationQueue,
      AuditLog,
      Report,
      User,
      Provider,
      Campaign,
      Donation,
      Volunteer,
    ]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ModerationService, AuditService, ReportService],
  exports: [ReviewService, ModerationService, AuditService, ReportService],
})
export class ReviewModule {}
