import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditLog } from '@love-app/common/entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async logAction(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    before?: any,
    after?: any,
  ) {
    const auditLog = this.auditLogRepository.create({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      before,
      after,
    });

    await this.auditLogRepository.save(auditLog);
    return auditLog;
  }

  async getAuditLogs(entityType?: string, entityId?: string, actorId?: string) {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (entityType) {
      query.andWhere('audit.entity_type = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('audit.entity_id = :entityId', { entityId });
    }

    if (actorId) {
      query.andWhere('audit.actor_id = :actorId', { actorId });
    }

    return query
      .orderBy('audit.timestamp', 'DESC')
      .limit(100)
      .getMany();
  }
}