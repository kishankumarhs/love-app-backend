import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 50 })
  entityType: string;

  @ApiProperty()
  @Column('uuid')
  entityId: string;

  @ApiProperty({ enum: AuditAction })
  @Column({ type: 'varchar', length: 20 })
  action: AuditAction;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  userId: string;

  @ApiProperty()
  @Column({ nullable: true })
  userEmail: string;

  @ApiProperty()
  @Column({ type: 'inet', nullable: true })
  ipAddress: string;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  userAgent: string;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, any>;

  @ApiProperty()
  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
