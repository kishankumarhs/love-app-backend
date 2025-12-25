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

export enum AdminActionType {
  USER_SUSPEND = 'user_suspend',
  USER_ACTIVATE = 'user_activate',
  PROVIDER_APPROVE = 'provider_approve',
  PROVIDER_REJECT = 'provider_reject',
  CAMPAIGN_APPROVE = 'campaign_approve',
  CAMPAIGN_SUSPEND = 'campaign_suspend',
  VOLUNTEER_APPROVE = 'volunteer_approve',
  CONTENT_MODERATE = 'content_moderate',
}

@Entity('admin_actions')
export class AdminAction {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  admin: User;

  @Column()
  adminId: string;

  @ApiProperty({ enum: AdminActionType })
  @Column({ type: 'varchar', length: 50 })
  actionType: AdminActionType;

  @ApiProperty()
  @Column({ length: 50 })
  targetType: string;

  @ApiProperty()
  @Column('uuid')
  targetId: string;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  reason: string;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  metadata: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
