import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

@Entity('notification_preferences')
export class NotificationPreference {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ default: true })
  emailNotifications: boolean;

  @ApiProperty()
  @Column({ default: true })
  smsNotifications: boolean;

  @ApiProperty()
  @Column({ default: true })
  pushNotifications: boolean;

  @ApiProperty()
  @Column({ default: true })
  campaignUpdates: boolean;

  @ApiProperty()
  @Column({ default: true })
  volunteerOpportunities: boolean;

  @ApiProperty()
  @Column({ default: true })
  emergencyAlerts: boolean;

  @ApiProperty()
  @Column({ default: true })
  donationReceipts: boolean;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
