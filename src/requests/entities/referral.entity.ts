import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestId: string;

  @Column()
  providerId: string;

  @Column()
  referredBy: string;

  @Column({ default: 'pending' })
  status: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  contactedAt: Date;

  @Column({ nullable: true })
  responseReceived: boolean;

  @Column('text', { nullable: true })
  providerResponse: string;

  @Column({ nullable: true })
  appointmentDate: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @ManyToOne('Request', (request: any) => request.referrals)
  @JoinColumn({ name: 'requestId' })
  request: any;

  @ManyToOne('Provider')
  @JoinColumn({ name: 'providerId' })
  provider: any;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referredBy' })
  referrer: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
