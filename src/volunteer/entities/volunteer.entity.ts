import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export enum VolunteerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('volunteers')
export class Volunteer {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  interests: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  skills: string[];

  @ApiProperty()
  @Column({ nullable: true })
  availability: string;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  locationPreferences: {
    preferredAreas?: string[];
    maxDistance?: number;
    transportationMode?: string;
    availableRegions?: string[];
  };

  @ApiProperty()
  @Column('json', { nullable: true })
  preferences: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    volunteerTypes?: string[];
    maxDistance?: number;
    timeCommitment?: string;
  };

  @ApiProperty({ enum: VolunteerStatus })
  @Column({ type: 'varchar', length: 20, default: VolunteerStatus.ACTIVE })
  status: VolunteerStatus;

  @ApiProperty({ enum: VerificationStatus })
  @Column({ type: 'varchar', length: 20, default: VerificationStatus.PENDING })
  verificationStatus: VerificationStatus;

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