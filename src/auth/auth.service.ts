import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: RegisterDto): Promise<{ user: User; token: string }> {
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
    return { user, token };
  }

  async signIn(signInDto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.userService.findByEmail(signInDto.email);
    if (!user || !(await bcrypt.compare(signInDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async googleLogin(req: any): Promise<{ user: User; token: string }> {
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
    return { user, token };
  }

  private generateToken(user: User): string {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return this.jwtService.sign(payload);
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userService.findOne(decoded.sub);
      if (user) {
        // Update user email verification status
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
