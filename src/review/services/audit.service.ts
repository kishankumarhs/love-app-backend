import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    entityType: string,
    entityId: string,
    action: AuditAction,
    userId?: string,
    userEmail?: string,
    ipAddress?: string,
    userAgent?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    metadata?: Record<string, any>,
  ): Promise<AuditLog> {
    const changes = this.calculateChanges(oldValues, newValues);

    const auditLog = this.auditLogRepository.create({
      entityType,
      entityId,
      action,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      oldValues,
      newValues,
      changes,
      metadata: metadata || {},
    });

    return await this.auditLogRepository.save(auditLog);
  }

  async getAuditLogs(
    entityType?: string,
    entityId?: string,
    userId?: string,
    action?: AuditAction,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
    offset: number = 0,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.createdAt', 'DESC');

    if (entityType) {
      query.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('audit.entityId = :entityId', { entityId });
    }

    if (userId) {
      query.andWhere('audit.userId = :userId', { userId });
    }

    if (action) {
      query.andWhere('audit.action = :action', { action });
    }

    if (startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    const [logs, total] = await query
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { logs, total };
  }

  private calculateChanges(
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
  ): Record<string, any> {
    if (!oldValues || !newValues) {
      return {};
    }

    const changes: Record<string, any> = {};
    const allKeys = new Set([
      ...Object.keys(oldValues),
      ...Object.keys(newValues),
    ]);

    for (const key of allKeys) {
      const oldValue = oldValues[key];
      const newValue = newValues[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = {
          from: oldValue,
          to: newValue,
        };
      }
    }

    return changes;
  }
}
