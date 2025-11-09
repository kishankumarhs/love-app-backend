import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export enum VolunteerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('volunteers')
@Index(['user_id'])
@Index(['status'])
export class Volunteer {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty()
  @Column('simple-array', { default: '' })
  interests: string[];

  @ApiProperty()
  @Column('simple-array', { default: '' })
  preferred_locations: string[];

  @ApiProperty({ enum: VolunteerStatus })
  @Column({ type: 'enum', enum: VolunteerStatus, default: VolunteerStatus.ACTIVE })
  status: VolunteerStatus;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}