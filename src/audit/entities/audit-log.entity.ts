import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: AuditAction })
  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @ApiProperty()
  @Column()
  entityType: string;

  @ApiProperty()
  @Column({ nullable: true })
  entityId: string;

  @ApiProperty()
  @Column('json', { nullable: true })
  changes: any;

  @ApiProperty()
  @Column({ nullable: true })
  ipAddress: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  userId: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}