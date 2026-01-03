import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

/**
 * Review Entity (Service Feedback)
 * - MVP Rule: All mobile feedback is strictly MODERATED (defaults to PENDING).
 * - Mobile App: Users can submit feedback via `POST /reviews/feedback`.
 * - Anonymity: Logic is handled at the Service layer (ReviewService), masking User ID if `isAnonymous` is true.
 */
@Entity('reviews')
export class Review {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('int')
  rating: number;

  @ApiProperty()
  @Column('text', { nullable: true })
  comment: string;

  @ApiProperty({ enum: ReviewStatus })
  @Column({ type: 'varchar', length: 20, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @ApiProperty()
  @Column({ default: false })
  isAnonymous: boolean;

  @ApiProperty()
  @Column({ default: 0 })
  helpfulCount: number;

  @ApiProperty()
  @Column({ default: 0 })
  reportedCount: number;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne('Provider')
  @JoinColumn()
  provider: any;

  @Column()
  providerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  moderatedBy: User;

  @Column({ nullable: true })
  moderatedById: string;

  @ApiProperty()
  @Column({ nullable: true })
  moderatedAt: Date;

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
