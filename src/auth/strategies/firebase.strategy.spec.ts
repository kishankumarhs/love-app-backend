import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseStrategy } from './firebase.strategy';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

// Mock firebase-admin module structure
jest.mock('firebase-admin', () => ({
    apps: [],
    initializeApp: jest.fn(),
    credential: {
        cert: jest.fn(),
    },
    auth: jest.fn(),
}));

describe('FirebaseStrategy', () => {
    let strategy: FirebaseStrategy;
    let userService: UserService;

    // Mock auth service inside firebase-admin
    const mockVerifyIdToken = jest.fn();
    const mockSetCustomUserClaims = jest.fn();
    const mockAuthService = {
        verifyIdToken: mockVerifyIdToken,
        setCustomUserClaims: mockSetCustomUserClaims,
    };

    const mockUserService = {
        findByEmail: jest.fn(),
        create: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'firebase.credentialsPath') return null;
            return null;
        }),
    };

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();

        // Configure admin.auth() to return our mock service object
        (admin.auth as unknown as jest.Mock).mockReturnValue(mockAuthService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FirebaseStrategy,
                { provide: UserService, useValue: mockUserService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        strategy = module.get<FirebaseStrategy>(FirebaseStrategy);
        userService = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    describe('validate', () => {
        it('should return existing user if found', async () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            mockVerifyIdToken.mockResolvedValue({
                email: 'test@example.com',
            });
            mockUserService.findByEmail.mockResolvedValue(mockUser);

            const result = await strategy.validate('valid-token');
            expect(result).toEqual(mockUser);
            expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(mockUserService.create).not.toHaveBeenCalled();
        });

        it('should create and return new user if not found', async () => {
            const mockDecodedToken = {
                email: 'new@example.com',
                name: 'New User',
            };
            const newUser = { id: '2', ...mockDecodedToken };

            mockVerifyIdToken.mockResolvedValue(mockDecodedToken);
            mockUserService.findByEmail.mockResolvedValue(null);
            mockUserService.create.mockResolvedValue(newUser);

            const result = await strategy.validate('valid-token');
            expect(result).toEqual(newUser);
            expect(mockUserService.findByEmail).toHaveBeenCalledWith('new@example.com');
            expect(mockUserService.create).toHaveBeenCalledWith(expect.objectContaining({
                email: 'new@example.com',
                firstName: 'New',
                lastName: 'User',
            }));
        });

        it('should throw UnauthorizedException if token is invalid', async () => {
            mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

            await expect(strategy.validate('invalid-token')).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if token has no email', async () => {
            mockVerifyIdToken.mockResolvedValue({ uid: '123' });

            await expect(strategy.validate('no-email-token')).rejects.toThrow(UnauthorizedException);
        });
    });
});
