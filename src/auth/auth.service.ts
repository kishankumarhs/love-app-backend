import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as admin from 'firebase-admin';
import { UserRole } from '../user/entities/user.entity';
import { AuthResponse } from '../common/types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userService.findOne(decoded.sub);
      if (user) {
        // Update user email verification status
        await this.userService.update(user.id, { isEmailVerified: true });
        user.isEmailVerified = true;

        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async findByEmail(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async firebaseAuth(
    idToken: string,
    role: UserRole,
  ): Promise<Partial<AuthResponse>> {
    try {
      console.log(idToken)
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { email, name, uid } = decodedToken;
      let user = await this.userService.findByEmail(email);
      if (!user) {
        const [firstName, ...lastNameParts] = (name || '').split(' ');
        user = await this.userService.create({
          email,
          firstName: firstName || 'User',
          lastName: lastNameParts.join(' ') || '',
          password: '',
          isEmailVerified: true,
          role,
        });
        await admin.auth().setCustomUserClaims(uid, {
          role,
          permissions: ['read', 'write'],
        });
      }
      return {
        user,
      };
    } catch (error) {
      console.log(error)
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
