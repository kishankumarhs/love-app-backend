import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  private defaultApp: admin.app.App;

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });

    this.defaultApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.get('firebase.projectId'),
        privateKey: this.configService
          .get('firebase.privateKey')
          ?.replace(/\\n/g, '\n'),
        clientEmail: this.configService.get('firebase.email'),
      }),
    });
  }

  async validate(token: string) {
    try {
      const firebaseUser = await this.defaultApp.auth().verifyIdToken(token);
      if (!firebaseUser) {
        throw new UnauthorizedException();
      }
      return firebaseUser;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
