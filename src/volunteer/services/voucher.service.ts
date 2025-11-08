import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { WifiVoucher, VoucherStatus } from '../entities/wifi-voucher.entity';
import { VoucherUsageLog, VoucherEventType } from '../entities/voucher-usage-log.entity';
import { CreateWifiVoucherDto } from '../dto/create-wifi-voucher.dto';
import { ActivateVoucherDto } from '../dto/activate-voucher.dto';

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);

  constructor(
    @InjectRepository(WifiVoucher)
    private voucherRepository: Repository<WifiVoucher>,
    @InjectRepository(VoucherUsageLog)
    private usageLogRepository: Repository<VoucherUsageLog>,
  ) {}

  async createVoucher(createVoucherDto: CreateWifiVoucherDto): Promise<WifiVoucher> {
    const code = this.generateVoucherCode();
    const expiresAt = createVoucherDto.expiresAt 
      ? new Date(createVoucherDto.expiresAt)
      : new Date(Date.now() + (createVoucherDto.durationHours || 24) * 60 * 60 * 1000);

    const voucher = this.voucherRepository.create({
      code,
      providerId: createVoucherDto.providerId,
      campaignId: createVoucherDto.campaignId,
      userId: createVoucherDto.userId,
      durationHours: createVoucherDto.durationHours || 24,
      bandwidthLimitMb: createVoucherDto.bandwidthLimitMb,
      maxDevices: createVoucherDto.maxDevices || 1,
      expiresAt,
      status: VoucherStatus.ACTIVE,
    });

    const savedVoucher = await this.voucherRepository.save(voucher);
    
    await this.logVoucherEvent(savedVoucher.id, VoucherEventType.CREATED, {
      code: savedVoucher.code,
      expiresAt: savedVoucher.expiresAt,
    });

    return savedVoucher;
  }

  async activateVoucher(activateVoucherDto: ActivateVoucherDto): Promise<WifiVoucher> {
    const { code, deviceInfo } = activateVoucherDto;

    const voucher = await this.voucherRepository.findOne({
      where: { code },
      relations: ['provider', 'campaign'],
    });

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    if (voucher.status !== VoucherStatus.ACTIVE) {
      throw new BadRequestException(`Voucher is ${voucher.status}`);
    }

    if (voucher.expiresAt < new Date()) {
      voucher.status = VoucherStatus.EXPIRED;
      await this.voucherRepository.save(voucher);
      throw new BadRequestException('Voucher has expired');
    }

    voucher.activatedAt = new Date();
    voucher.deviceInfo = deviceInfo || {};
    voucher.status = VoucherStatus.USED;
    voucher.usedAt = new Date();

    const updatedVoucher = await this.voucherRepository.save(voucher);

    await this.logVoucherEvent(voucher.id, VoucherEventType.ACTIVATED, {
      deviceInfo,
      activatedAt: voucher.activatedAt,
    });

    return updatedVoucher;
  }

  async getVoucherByCode(code: string): Promise<WifiVoucher> {
    const voucher = await this.voucherRepository.findOne({
      where: { code },
      relations: ['provider', 'campaign', 'user'],
    });

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    return voucher;
  }

  async getVouchersByProvider(providerId: string): Promise<WifiVoucher[]> {
    return await this.voucherRepository.find({
      where: { providerId },
      relations: ['campaign', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async revokeVoucher(voucherId: string, reason?: string): Promise<WifiVoucher> {
    const voucher = await this.voucherRepository.findOne({
      where: { id: voucherId },
    });

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    voucher.status = VoucherStatus.REVOKED;
    const updatedVoucher = await this.voucherRepository.save(voucher);

    await this.logVoucherEvent(voucherId, VoucherEventType.REVOKED, {
      reason,
      revokedAt: new Date(),
    });

    return updatedVoucher;
  }

  async expireVouchers(): Promise<void> {
    const expiredVouchers = await this.voucherRepository.find({
      where: {
        status: VoucherStatus.ACTIVE,
        expiresAt: LessThan(new Date()),
      },
    });

    for (const voucher of expiredVouchers) {
      voucher.status = VoucherStatus.EXPIRED;
      await this.voucherRepository.save(voucher);
      
      await this.logVoucherEvent(voucher.id, VoucherEventType.EXPIRED, {
        expiredAt: new Date(),
      });
    }
  }

  private generateVoucherCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async logVoucherEvent(
    voucherId: string,
    eventType: VoucherEventType,
    metadata: any,
  ): Promise<void> {
    const log = this.usageLogRepository.create({
      voucherId,
      eventType,
      deviceMac: metadata.deviceMac,
      deviceInfo: metadata.deviceInfo || {},
      ipAddress: metadata.ipAddress,
      dataUsedMb: metadata.dataUsedMb,
      sessionDurationMinutes: metadata.sessionDurationMinutes,
    });

    await this.usageLogRepository.save(log);
  }
}