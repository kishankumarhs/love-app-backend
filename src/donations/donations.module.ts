import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Donation } from './entities/donation.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { DonationHistory } from './entities/donation-history.entity';
import { Refund } from './entities/refund.entity';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { StripeService } from './services/stripe.service';
import stripeConfig from '../config/stripe.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Donation,
      PaymentMethod,
      DonationHistory,
      Refund,
    ]),
    ConfigModule.forFeature(stripeConfig),
  ],
  controllers: [DonationsController],
  providers: [DonationsService, StripeService],
  exports: [DonationsService, StripeService, TypeOrmModule],
})
export class DonationsModule {}
