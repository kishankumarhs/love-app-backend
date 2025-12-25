import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DonationsService } from './donations.service';
import { Donation } from './entities/donation.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { DonationHistory } from './entities/donation-history.entity';
import { Refund } from './entities/refund.entity';
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
          provide: getRepositoryToken(PaymentMethod),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(DonationHistory),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Refund),
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
      const createDto = { amount: 100, campaignId: '1' };
      const paymentIntent = { id: 'pi_test', client_secret: 'secret' };
      const donation = { id: '1', amount: 100, campaignId: '1' };

      jest
        .spyOn(stripeService, 'createPaymentIntent')
        .mockResolvedValue(paymentIntent as any);
      mockRepository.create.mockReturnValue(donation);
      mockRepository.save.mockResolvedValue(donation);

      const result = await service.createPaymentIntent(createDto);
      expect(result).toHaveProperty('donation');
      expect(result).toHaveProperty('clientSecret');
    });
  });

  describe('getDonationHistory', () => {
    it('should return donation history', async () => {
      const donations = [{ id: '1', amount: 100, userId: '1' }];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(donations),
        getOne: jest.fn(),
        getManyAndCount: jest.fn(),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getDonationHistory('1');
      expect(result).toEqual(donations);
    });
  });
});
