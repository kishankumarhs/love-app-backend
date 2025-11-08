import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity('volunteer_applications')
export class VolunteerApplication {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ApiProperty()
  @Column('simple-array', { default: '{}' })
  interests: string[];

  @ApiProperty()
  @Column('simple-array', { default: '{}' })
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
  @Column({ nullable: true, type: 'text' })
  motivation: string;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  experience: string;

  @ApiProperty()
  @Column('jsonb', { default: '[]' })
  references: Array<{
    name: string;
    email: string;
    phone?: string;
    relationship: string;
  }>;

  @ApiProperty({ enum: ApplicationStatus })
  @Column({ type: 'varchar', length: 20, default: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  reviewedBy: User;

  @Column({ nullable: true })
  reviewedById: string;

  @ApiProperty()
  @Column({ nullable: true })
  reviewedAt: Date;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  rejectionReason: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}