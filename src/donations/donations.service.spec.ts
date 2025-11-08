import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DonationsService } from './donations.service';
import { Donation } from './entities/donation.entity';
import { StripeService } from './services/stripe.service';
import { mockRepository } from '../test/setup';

describe('DonationsService', () => {
  let service: DonationsService;
  let stripeService: StripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        {
          provide: getRepositoryToken(Donation),
          useValue: mockRepository,
        },
        {
          provide: StripeService,
          useValue: {
            createPaymentIntent: jest.fn(),
            confirmPayment: jest.fn(),
            createRefund: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DonationsService>(DonationsService);
    stripeService = module.get<StripeService>(StripeService);
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent', async () => {
      const createDto = { amount: 100, currency: 'usd', campaignId: '1' };
      const paymentIntent = {
        id: 'pi_test',
        client_secret: 'secret',
        object: 'payment_intent',
        amount: 100,
        amount_capturable: 0,
        amount_received: 0,
        currency: 'usd',
        status: 'requires_payment_method',
      };

      jest
        .spyOn(stripeService, 'createPaymentIntent')
        .mockResolvedValue(paymentIntent as any);

      const result = await service.createPaymentIntent(createDto);
      expect(result).toEqual(paymentIntent);
      expect(stripeService.createPaymentIntent).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findByUserId', () => {
    it('should return user donations', async () => {
      const donations = [{ id: '1', amount: 100, userId: '1' }];
      mockRepository.find.mockResolvedValue(donations);

      const result = await service.getDonationHistory('1');
      expect(result).toEqual(donations);
    });
  });
});
