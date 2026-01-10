import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import path from 'path';
import fs from 'fs';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class FirebaseStrategy
  extends PassportStrategy(Strategy, 'firebase')
  implements OnModuleInit
{
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: (req) => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
          const parts = authHeader.split(' ');
          // Handle "Bearer <token>" or accidentally doubled "Bearer Bearer <token>"
          if (parts.length >= 2) {
            return parts[parts.length - 1];
          }
        }
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
    });
  }
  onModuleInit() {
    if (admin.apps.length === 0) {
      try {
        // Try loading from JSON file first if path is provided or exists in a known location
        const credsFilePath = path.isAbsolute(
          this.configService.get('firebase.credentialsPath') || '',
        )
          ? this.configService.get('firebase.credentialsPath')
          : path.join(process.cwd(), 'src/auth/strategies/firebase-creds.json');

        if (fs.existsSync(credsFilePath)) {
          admin.initializeApp({
            credential: admin.credential.cert(credsFilePath),
          });
          console.log('Firebase Admin initialized successfully from JSON file');
        }
      } catch (e) {
        console.error('Firebase Admin initialization failed:', e);
      }
    }
  }

  async validate(token: string) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      if (!decoded) throw new UnauthorizedException();

      const { email, name } = decoded;
      if (!email) {
        throw new UnauthorizedException(
          'Token does not contain an email address',
        );
      }

      let user = await this.userService.findByEmail(email);
      if (!user) {
        // Auto-provision
        const [firstName, ...lastNameParts] = (name || '').split(' ');
        user = await this.userService.create({
          email,
          firstName: firstName || 'User',
          lastName: lastNameParts.join(' ') || '',
          password: '',
          isEmailVerified: true,
          role: UserRole.USER,
        });
      }

      return user;
    } catch (err) {
      console.error('Firebase Auth Error:', err);
      throw new UnauthorizedException(`Invalid Firebase Token: ${err.message}`);
    }
  }
}
