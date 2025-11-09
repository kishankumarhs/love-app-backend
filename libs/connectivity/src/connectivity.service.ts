import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { WifiToken, TokenStatus } from './entities/wifi-token.entity';
import { CreateWifiTokenDto, ValidateTokenDto } from './dto/connectivity.dto';

@Injectable()
export class ConnectivityService {
  constructor(
    @InjectRepository(WifiToken)
    private wifiTokenRepository: Repository<WifiToken>,
  ) {}

  async createToken(createWifiTokenDto: CreateWifiTokenDto) {
    const token = this.generateToken();
    const ttl = createWifiTokenDto.ttl || 3600; // Default 1 hour
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + ttl);

    const wifiToken = this.wifiTokenRepository.create({
      token,
      ttl,
      expires_at: expiresAt,
      user_id: createWifiTokenDto.user_id,
      metadata: createWifiTokenDto.metadata || {},
    });

    await this.wifiTokenRepository.save(wifiToken);

    return {
      token: wifiToken.token,
      expires_at: wifiToken.expires_at,
      ttl: wifiToken.ttl,
    };
  }

  async validateToken(validateTokenDto: ValidateTokenDto) {
    const { token } = validateTokenDto;
    
    const wifiToken = await this.wifiTokenRepository.findOne({
      where: { token },
    });

    if (!wifiToken) {
      throw new NotFoundException('Token not found');
    }

    if (wifiToken.status !== TokenStatus.ACTIVE) {
      throw new Error('Token is not active');
    }

    if (new Date() > wifiToken.expires_at) {
      // Mark as expired
      wifiToken.status = TokenStatus.EXPIRED;
      await this.wifiTokenRepository.save(wifiToken);
      throw new Error('Token has expired');
    }

    // Mark as used
    wifiToken.status = TokenStatus.USED;
    wifiToken.used_at = new Date();
    await this.wifiTokenRepository.save(wifiToken);

    return {
      valid: true,
      user_id: wifiToken.user_id,
      metadata: wifiToken.metadata,
      expires_at: wifiToken.expires_at,
    };
  }

  private generateToken(): string {
    // Generate a secure random token
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 12; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredTokens() {
    // Clean up expired tokens older than 24 hours
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 24);

    await this.wifiTokenRepository.delete({
      expires_at: LessThan(cutoffDate),
      status: TokenStatus.EXPIRED,
    });
  }

  async getTokenStats() {
    const [active, used, expired] = await Promise.all([
      this.wifiTokenRepository.count({ where: { status: TokenStatus.ACTIVE } }),
      this.wifiTokenRepository.count({ where: { status: TokenStatus.USED } }),
      this.wifiTokenRepository.count({ where: { status: TokenStatus.EXPIRED } }),
    ]);

    return { active, used, expired, total: active + used + expired };
  }
}