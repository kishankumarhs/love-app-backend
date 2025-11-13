import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import * as admin from 'firebase-admin';
import { User } from '../user/entities/user.entity';
import { AuthResponse } from 'src/common/types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userService.findByEmail(signUpDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
    const user = await this.userService.create({
      ...signUpDto,
      password: hashedPassword,
    });

    const token = this.generateToken(user);
    return { user, token: token.accessToken, refreshToken: token.refreshToken };
  }

  async signIn(signInDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userService.findByEmail(signInDto.email);
    if (!user || !(await bcrypt.compare(signInDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials Or Username');
    }
    delete user.password;
    const token = this.generateToken(user);
    return {
      user: user,
      token: token.accessToken,
      refreshToken: token.refreshToken,
    };
  }

  async googleLogin(req: any): Promise<AuthResponse> {
    const { email, firstName, lastName } = req.user;

    let user = await this.userService.findByEmail(email);
    if (!user) {
      user = await this.userService.create({
        email,
        firstName,
        lastName,
        password: '', // OAuth users don't need password
        isEmailVerified: true,
      });
    }

    const token = this.generateToken(user);
    return { user, token: token.accessToken, refreshToken: token.refreshToken };
  }

  private generateToken(user: Omit<User, 'password'>): {
    accessToken: string;
    refreshToken: string;
  } {
    // Generate access token (short-lived)
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    // Generate refresh token (long-lived)
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

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

  async refreshToken(rfToken: string): Promise<Omit<AuthResponse, 'user'>> {
    const isRfVerified = this.jwtService.verify(rfToken, {
      ignoreExpiration: true,
    });
    if (!isRfVerified) throw new UnauthorizedException();
    const user = await this.userService.findOne(isRfVerified.sub);
    if (!user) throw new UnauthorizedException();
    const token = this.generateToken(user);
    return { token: token.accessToken, refreshToken: token.refreshToken };
  }

  async firebaseAuth(idToken: string): Promise<AuthResponse> {
    try {
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
        });
      }

      const token = this.generateToken(user);
      return {
        user,
        token: token.accessToken,
        refreshToken: token.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
