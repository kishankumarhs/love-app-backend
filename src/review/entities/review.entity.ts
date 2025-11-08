import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Provider } from '../../provider/entities/provider.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

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

  @ManyToOne(() => Provider)
  @JoinColumn()
  provider: Provider;

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