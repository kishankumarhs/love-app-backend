import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Org,
  Service,
  Campaign,
  CampaignLocation,
  Category,
  User,
} from '@love-app/common';

import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Org,
      Service,
      Campaign,
      CampaignLocation,
      Category,
      User,
    ]),
  ],
  providers: [ProvidersService],
  controllers: [ProvidersController],
  exports: [ProvidersService],
})
export class ProvidersModule {}
