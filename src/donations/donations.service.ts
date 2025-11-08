import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation, DonationStatus } from './entities/donation.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { DonationHistory, DonationEventType } from './entities/donation-history.entity';
import { Refund, RefundStatus } from './entities/refund.entity';
import { StripeService } from './services/stripe.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { SavePaymentMethodDto } from './dto/save-payment-method.dto';

@Injectable()
export class DonationsService {
  private readonly logger = new Logger(DonationsService.name);

  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(DonationHistory)
    private donationHistoryRepository: Repository<DonationHistory>,
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    private stripeService: StripeService,
  ) {}

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto) {
    const { amount, campaignId, userId, paymentMethodId, providerId } = createPaymentIntentDto;

    try {
      const metadata = {
        campaignId,
        ...(userId && { userId }),
        ...(providerId && { providerId }),
      };

      const paymentIntent = await this.stripeService.createPaymentIntent(
        amount,
        'usd',
        metadata,
        paymentMethodId,
      );

      // Create donation record
      const donation = this.donationRepository.create({
        amount,
        campaignId,
        userId,
        providerId,
        stripePaymentIntentId: paymentIntent.id,
        status: DonationStatus.PENDING,
        metadata: { paymentIntentId: paymentIntent.id },
      });

      const savedDonation = await this.donationRepository.save(donation);

      // Create history entry
      await this.createDonationHistory(
        savedDonation.id,
        DonationEventType.CREATED,
        'Donation created with payment intent',
      );

      return {
        donation: savedDonation,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error('Failed to create payment intent', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmDonation(donationId: string) {
    const donation = await this.donationRepository.findOne({
      where: { id: donationId },
      relations: ['campaign', 'user', 'provider'],
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    try {
      const paymentIntent = await this.stripeService.retrievePaymentIntent(
        donation.stripePaymentIntentId,
      );

      if (paymentIntent.status === 'succeeded') {
        donation.status = DonationStatus.COMPLETED;
        donation.completedAt = new Date();
        donation.stripeChargeId = paymentIntent.latest_charge as string;

        await this.donationRepository.save(donation);
        await this.createDonationHistory(
          donation.id,
          DonationEventType.COMPLETED,
          'Payment completed successfully',
        );

        return donation;
      } else if (paymentIntent.status === 'requires_payment_method') {
        donation.status = DonationStatus.FAILED;
        donation.failureReason = 'Payment method required';

        await this.donationRepository.save(donation);
        await this.createDonationHistory(
          donation.id,
          DonationEventType.FAILED,
          'Payment failed - payment method required',
        );

        throw new BadRequestException('Payment requires valid payment method');
      }

      return donation;
    } catch (error) {
      this.logger.error('Failed to confirm donation', error);
      throw error;
    }
  }

  async createRefund(createRefundDto: CreateRefundDto) {
    const { donationId, amount, reason } = createRefundDto;

    const donation = await this.donationRepository.findOne({
      where: { id: donationId },
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    if (donation.status !== DonationStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed donations');
    }

    if (!donation.stripeChargeId) {
      throw new BadRequestException('No charge ID found for this donation');
    }

    try {
      const stripeRefund = await this.stripeService.createRefund(
        donation.stripeChargeId,
        amount,
        reason,
      );

      const refund = this.refundRepository.create({
        donationId,
        stripeRefundId: stripeRefund.id,
        amount: stripeRefund.amount / 100, // Convert from cents
        reason,
        status: RefundStatus.PENDING,
      });

      const savedRefund = await this.refundRepository.save(refund);

      // Update donation status if full refund
      if (!amount || amount >= donation.amount) {
        donation.status = DonationStatus.REFUNDED;
        donation.refundedAt = new Date();
        await this.donationRepository.save(donation);
      }

      await this.createDonationHistory(
        donation.id,
        DonationEventType.REFUNDED,
        `Refund initiated: $${savedRefund.amount}`,
      );

      return savedRefund;
    } catch (error) {
      this.logger.error('Failed to create refund', error);
      throw new BadRequestException('Failed to process refund');
    }
  }

  async savePaymentMethod(userId: string, savePaymentMethodDto: SavePaymentMethodDto) {
    const { stripePaymentMethodId, setAsDefault } = savePaymentMethodDto;

    try {
      const stripePaymentMethod = await this.stripeService.retrievePaymentMethod(
        stripePaymentMethodId,
      );

      if (setAsDefault) {
        await this.paymentMethodRepository.update(
          { userId },
          { isDefault: false },
        );
      }

      const paymentMethod = this.paymentMethodRepository.create({
        userId,
        stripePaymentMethodId,
        type: stripePaymentMethod.type,
        lastFour: stripePaymentMethod.card?.last4,
        brand: stripePaymentMethod.card?.brand,
        expMonth: stripePaymentMethod.card?.exp_month,
        expYear: stripePaymentMethod.card?.exp_year,
        isDefault: setAsDefault || false,
      });

      return await this.paymentMethodRepository.save(paymentMethod);
    } catch (error) {
      this.logger.error('Failed to save payment method', error);
      throw new BadRequestException('Failed to save payment method');
    }
  }

  async getUserPaymentMethods(userId: string) {
    return await this.paymentMethodRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async getDonationHistory(userId?: string, campaignId?: string) {
    const query = this.donationRepository.createQueryBuilder('donation')
      .leftJoinAndSelect('donation.campaign', 'campaign')
      .leftJoinAndSelect('donation.user', 'user')
      .leftJoinAndSelect('donation.provider', 'provider')
      .orderBy('donation.createdAt', 'DESC');

    if (userId) {
      query.where('donation.userId = :userId', { userId });
    }

    if (campaignId) {
      query.andWhere('donation.campaignId = :campaignId', { campaignId });
    }

    return await query.getMany();
  }

  async getDonationById(id: string) {
    const donation = await this.donationRepository.findOne({
      where: { id },
      relations: ['campaign', 'user', 'provider'],
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    return donation;
  }

  private async createDonationHistory(
    donationId: string,
    eventType: DonationEventType,
    description: string,
    metadata?: Record<string, any>,
  ) {
    const history = this.donationHistoryRepository.create({
      donationId,
      eventType,
      description,
      metadata: metadata || {},
    });

    return await this.donationHistoryRepository.save(history);
  }

  async handleWebhookEvent(event: any) {
    this.logger.log(`Handling webhook event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object);
        break;
      case 'charge.dispute.created':
        await this.handleChargeDispute(event.data.object);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    const donation = await this.donationRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (donation && donation.status === DonationStatus.PENDING) {
      donation.status = DonationStatus.COMPLETED;
      donation.completedAt = new Date();
      donation.stripeChargeId = paymentIntent.latest_charge;

      await this.donationRepository.save(donation);
      await this.createDonationHistory(
        donation.id,
        DonationEventType.COMPLETED,
        'Payment completed via webhook',
      );
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: any) {
    const donation = await this.donationRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (donation && donation.status === DonationStatus.PENDING) {
      donation.status = DonationStatus.FAILED;
      donation.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';

      await this.donationRepository.save(donation);
      await this.createDonationHistory(
        donation.id,
        DonationEventType.FAILED,
        'Payment failed via webhook',
      );
    }
  }

  private async handleChargeDispute(dispute: any) {
    const donation = await this.donationRepository.findOne({
      where: { stripeChargeId: dispute.charge },
    });

    if (donation) {
      await this.createDonationHistory(
        donation.id,
        DonationEventType.DISPUTED,
        `Charge disputed: ${dispute.reason}`,
        { disputeId: dispute.id },
      );
    }
  }
}