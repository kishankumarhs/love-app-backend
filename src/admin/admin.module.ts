import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ProviderModule } from '../provider/provider.module';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
  imports: [UserModule, ProviderModule, CampaignModule],
})
export class AdminModule {}