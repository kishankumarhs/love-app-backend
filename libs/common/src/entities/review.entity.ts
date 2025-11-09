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
import { Org } from './org.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('reviews')
@Index(['seeker_id'])
@Index(['org_id'])
@Index(['status'])
export class Review {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ nullable: true })
  seeker_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'seeker_id' })
  seeker: User;

  @ApiProperty()
  @Column()
  org_id: string;

  @ManyToOne(() => Org)
  @JoinColumn({ name: 'org_id' })
  org: Org;

  @ApiProperty()
  @Column('int', { default: 5 })
  rating: number;

  @ApiProperty()
  @Column('text')
  text: string;

  @ApiProperty({ enum: ReviewStatus })
  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}