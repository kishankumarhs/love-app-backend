import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CacheService } from '@app/shared';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private cacheService: CacheService,
  ) {}

  async register(data: any) {
    const { email, password, ...userData } = data;
    
    // Check cache first
    const cachedUser = await this.cacheService.get(`user:email:${email}`);
    if (cachedUser) {
      throw new UnauthorizedException('User already exists');
    }

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      ...userData,
    });

    const savedUser = await this.userRepository.save(user);
    
    // Cache user data
    await this.cacheService.set(`user:${savedUser.id}`, savedUser, 3600);
    await this.cacheService.set(`user:email:${email}`, savedUser, 3600);

    const { password: _, ...result } = savedUser;
    return { success: true, data: result };
  }

  async login(data: any) {
    const { email, password } = data;
    
    // Check cache first
    let user = await this.cacheService.get(`user:email:${email}`);
    if (!user) {
      user = await this.userRepository.findOne({ where: { email } });
      if (user) {
        await this.cacheService.set(`user:email:${email}`, user, 3600);
      }
    }

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Cache tokens
    await this.cacheService.set(`token:${user.id}`, accessToken, 900); // 15 min
    await this.cacheService.set(`refresh:${user.id}`, refreshToken, 604800); // 7 days

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, role: user.role },
      },
    };
  }

  async refreshToken(data: any) {
    const { refreshToken } = data;
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      });
      
      await this.cacheService.set(`token:${payload.sub}`, newAccessToken, 900);
      
      return { success: true, data: { accessToken: newAccessToken } };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    let user = await this.cacheService.get(`user:${userId}`);
    if (!user) {
      user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        await this.cacheService.set(`user:${userId}`, user, 3600);
      }
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user;
    return { success: true, data: result };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return { success: true, data: payload };
    } catch {
      return { success: false, error: 'Invalid token' };
    }
  }
}