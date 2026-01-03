import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

/**
 * Request Entity (Generic Service Interaction)
 * - Used for: Walk-ins, Slot Booking, SOS, and QR Code Attendance.
 * - NOTE: Slots are computed dynamically; booking a slot creates a Request record.
 * - There is NO separate Booking entity in the MVP.
 */
@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;



  @Column()
  urgency: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  providerId: string;

  @Column({ nullable: true })
  assignedTo: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  preferredContactMethod: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  completedAt: Date;

  /**
   * For Slot Booking: The start time of the booked slot.
   * If null, it is considered a "Walk-in" or "ASAP" request.
   */
  @Column({ nullable: true })
  scheduledAt: Date;

  /**
   * Request Type / Category
   * - 'sos': Emergency Signal (High Urgency)
   * - 'booking': Scheduled appointment (requires scheduledAt)
   * - 'walk_in': Immediate service request
   * - 'attendance': QR Code scan for presence
   */
  @Column()
  category: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne('Provider', { nullable: true })
  @JoinColumn({ name: 'providerId' })
  provider: any;

  @OneToMany('Referral', (referral: any) => referral.request)
  referrals: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
