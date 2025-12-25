import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: configService.get('firebase.projectId'),
        privateKey: configService
          .get('firebase.privateKey')
          ?.replace(/\\n/g, '\n'),
        clientEmail: configService.get('firebase.email'),
      }),
    });
  }

  async validate(token: string) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);

      if (!decoded) throw new UnauthorizedException();

      /**
       * decoded contains:
       * - uid
       * - email
       * - name
       * - picture
       * - role  <-- custom claim (ex: 'admin')
       * - permissions
       * - tenantId
       */
      return decoded;
    } catch (err) {
      throw new UnauthorizedException('Invalid Firebase Token');
    }
  }
}
