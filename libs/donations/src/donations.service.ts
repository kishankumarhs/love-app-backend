import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Donation, DonationStatus, DonationProvider } from '@love-app/common/entities/donation.entity';
import { CreateDonationDto, CreateStripeCheckoutDto, CreatePayPalOrderDto } from './dto/donation.dto';
import { StripeService } from './services/stripe.service';
import { PayPalService } from './services/paypal.service';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    private stripeService: StripeService,
    private paypalService: PayPalService,
  ) {}

  async createStripeCheckout(createStripeCheckoutDto: CreateStripeCheckoutDto, userId?: string) {
    const { amount, success_url, cancel_url, ...metadata } = createStripeCheckoutDto;

    // Create donation record
    const donation = this.donationRepository.create({
      amount,
      provider: DonationProvider.STRIPE,
      status: DonationStatus.PENDING,
      donor_user_id: userId,
      campaign_id: metadata.campaign_id,
      provider_org_id: metadata.provider_org_id,
    });

    await this.donationRepository.save(donation);

    // Create Stripe checkout session
    const session = await this.stripeService.createCheckoutSession(
      amount,
      success_url,
      cancel_url,
      { donation_id: donation.id, ...metadata },
    );

    // Update donation with external transaction ID
    donation.external_transaction_id = session.id;
    await this.donationRepository.save(donation);

    return {
      donation_id: donation.id,
      checkout_url: session.url,
      session_id: session.id,
    };
  }

  async createPayPalOrder(createPayPalOrderDto: CreatePayPalOrderDto, userId?: string) {
    const { amount, return_url, cancel_url, ...metadata } = createPayPalOrderDto;

    // Create donation record
    const donation = this.donationRepository.create({
      amount,
      provider: DonationProvider.PAYPAL,
      status: DonationStatus.PENDING,
      donor_user_id: userId,
      campaign_id: metadata.campaign_id,
      provider_org_id: metadata.provider_org_id,
    });

    await this.donationRepository.save(donation);

    // Create PayPal order
    const order = await this.paypalService.createOrder(amount, 'USD', return_url, cancel_url);

    // Update donation with external transaction ID
    donation.external_transaction_id = order.id;
    await this.donationRepository.save(donation);

    return {
      donation_id: donation.id,
      order_id: order.id,
      approval_url: order.links.find(link => link.rel === 'approve')?.href,
    };
  }

  async handleStripeWebhook(event: any) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.completeStripeDonation(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.failStripeDonation(event.data.object);
        break;
    }
  }

  async capturePayPalOrder(orderId: string) {
    const donation = await this.donationRepository.findOne({
      where: { external_transaction_id: orderId },
    });

    if (!donation) {
      throw new Error('Donation not found');
    }

    const result = await this.paypalService.captureOrder(orderId);
    
    if (result.status === 'COMPLETED') {
      donation.status = DonationStatus.COMPLETED;
      await this.donationRepository.save(donation);
    }

    return result;
  }

  private async completeStripeDonation(session: any) {
    const donationId = session.metadata?.donation_id;
    if (donationId) {
      await this.donationRepository.update(donationId, {
        status: DonationStatus.COMPLETED,
      });
    }
  }

  private async failStripeDonation(paymentIntent: any) {
    const donationId = paymentIntent.metadata?.donation_id;
    if (donationId) {
      await this.donationRepository.update(donationId, {
        status: DonationStatus.FAILED,
      });
    }
  }

  async getDonationHistory(userId: string) {
    return this.donationRepository.find({
      where: { donor_user_id: userId },
      relations: ['campaign', 'provider_org'],
      order: { created_at: 'DESC' },
    });
  }
}