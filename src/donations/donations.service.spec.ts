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
      const createDto = { amount: 100, currency: 'usd', campaignId: 1 };
      const paymentIntent = { id: 'pi_test', client_secret: 'secret' };
      
      jest.spyOn(stripeService, 'createPaymentIntent').mockResolvedValue(paymentIntent);

      const result = await service.createPaymentIntent(createDto, 1);
      expect(result).toEqual(paymentIntent);
      expect(stripeService.createPaymentIntent).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findUserDonations', () => {
    it('should return user donations', async () => {
      const donations = [{ id: 1, amount: 100, userId: 1 }];
      mockRepository.find.mockResolvedValue(donations);

      const result = await service.findUserDonations(1);
      expect(result).toEqual(donations);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['campaign'],
        order: { createdAt: 'DESC' },
      });
    });
  });
});