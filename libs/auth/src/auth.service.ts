import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, UserRole } from '@love-app/common/entities/user.entity';
import { RegisterDto, LoginDto, SocialLoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: registerDto.role || UserRole.SEEKER,
    });

    await this.userRepository.save(user);

    const { password, ...result } = user;
    return {
      user: result,
      token: this.generateToken(user),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = user;
    return {
      user: result,
      token: this.generateToken(user),
    };
  }

  async socialLogin(socialLoginDto: SocialLoginDto) {
    let user = await this.userRepository.findOne({
      where: { email: socialLoginDto.email },
    });

    if (!user) {
      user = this.userRepository.create({
        email: socialLoginDto.email,
        firstName: socialLoginDto.firstName,
        lastName: socialLoginDto.lastName,
        role: UserRole.SEEKER,
        isEmailVerified: true,
      });
      await this.userRepository.save(user);
    }

    const { password, ...result } = user;
    return {
      user: result,
      token: this.generateToken(user),
    };
  }

  async validateUser(userId: string): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
    };
    return this.jwtService.sign(payload);
  }
}
