import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('APPLE_CLIENT_ID'),
      teamID: configService.get<string>('APPLE_TEAM_ID'),
      keyID: configService.get<string>('APPLE_KEY_ID'),
      privateKeyString: configService.get<string>('APPLE_PRIVATE_KEY'),
      callbackURL: '/api/v1/auth/apple/callback',
      scope: ['name', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { name, email } = profile;
    const user = {
      email: email,
      firstName: name?.firstName || '',
      lastName: name?.lastName || '',
      provider: 'apple',
      providerId: profile.id,
    };
    return user;
  }
}
