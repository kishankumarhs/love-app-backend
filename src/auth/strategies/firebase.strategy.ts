import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import path from 'path';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') implements OnModuleInit {
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
        const credsFilePath = path.isAbsolute(this.configService.get('firebase.credentialsPath') || '')
          ? this.configService.get('firebase.credentialsPath')
          : path.join(process.cwd(), 'src/auth/strategies/firebase-creds.json');

        if (require('fs').existsSync(credsFilePath)) {
          admin.initializeApp({
            credential: admin.credential.cert(credsFilePath),
          });
          console.log('Firebase Admin initialized successfully from JSON file');
        } else {
          // Fallback to individual config values
          let privateKey = this.configService.get<string>('firebase.privateKey');
          const projectId = this.configService.get<string>('firebase.projectId');
          const clientEmail = this.configService.get<string>('firebase.email');

          if (privateKey) {
            privateKey = privateKey.replace(/\\n/g, '\n');
          }

          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              privateKey,
              clientEmail,
            }),
          });
          console.log('Firebase Admin initialized successfully from Config values');
        }
      } catch (e) {
        console.error('Firebase Admin initialization failed:', e);
      }
    }
  }

  async validate(token: string) {
    try {
      console.log('Firebase ID Token Preview:', {
        length: token?.length,
        prefix: token?.substring(0, 20),
      });
      const decoded = await admin.auth().verifyIdToken(token);
      if (!decoded) throw new UnauthorizedException();

      const { email } = decoded;
      if (!email) {
        throw new UnauthorizedException('Token does not contain an email address');
      }

      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('User not found in system');
      }

      return user;
    } catch (err) {
      console.error('Firebase Auth Error:', err);
      throw new UnauthorizedException(`Invalid Firebase Token: ${err.message}`);
    }
  }
}
