import { Test, TestingModule } from '@nestjs/testing';
import { ProviderService } from './provider.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { Employee } from './entities/employee.entity';
import { Review } from '../review/entities/review.entity';
import { UserService } from '../user/user.service';
import { CreateProvider } from './dto/create-provider.dto';
import { UserRole } from '../user/entities/user.entity';

describe('ProviderService', () => {
    let service: ProviderService;
    let providerRepository;
    let userService;

    const mockProviderRepository = {
        create: jest.fn(),
        save: jest.fn(),
        createQueryBuilder: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockEmployeeRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockReviewRepository = {
        find: jest.fn(),
    };

    const mockUserService = {
        update: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProviderService,
                {
                    provide: getRepositoryToken(Provider),
                    useValue: mockProviderRepository,
                },
                {
                    provide: getRepositoryToken(Employee),
                    useValue: mockEmployeeRepository,
                },
                {
                    provide: getRepositoryToken(Review),
                    useValue: mockReviewRepository,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        service = module.get<ProviderService>(ProviderService);
        providerRepository = module.get(getRepositoryToken(Provider));
        userService = module.get(UserService);
    });

    it('should create a provider with user relation explicitly set', async () => {
        const createProviderDto: CreateProvider = {
            name: 'Test Provider',
            email: 'test@provider.com',
            userId: 'user-123',
            organization: 'Test Org',
            service_area: ['Area 1'],
            capabilities: 'Test Cap',
            website: 'http://test.com',
            latitude: 10,
            longitude: 10,
            documentLinks: [],
        };

        mockUserService.update.mockResolvedValue(true);
        mockProviderRepository.create.mockImplementation((dto) => dto);
        mockProviderRepository.save.mockImplementation((provider) =>
            Promise.resolve({ id: 'provider-123', ...provider }),
        );

        const result = await service.create(createProviderDto);

        expect(userService.update).toHaveBeenCalledWith('user-123', {
            role: UserRole.PROVIDER,
        });

        // This is the critical check: verify create was called with user: { id: ... }
        expect(providerRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                ...createProviderDto,
                user: { id: 'user-123' },
            }),
        );

        expect(result).toEqual(
            expect.objectContaining({
                id: 'provider-123',
                user: { id: 'user-123' },
            }),
        );
    });
});
