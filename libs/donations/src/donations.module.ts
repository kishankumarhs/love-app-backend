import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { Donation } from '@love-app/common/entities/donation.entity';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { StripeService } from './services/stripe.service';
import { PayPalService } from './services/paypal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation]),
    ConfigModule,
  ],
  providers: [DonationsService, StripeService, PayPalService],
  controllers: [DonationsController],
  exports: [DonationsService],
})
export class DonationsModule {}