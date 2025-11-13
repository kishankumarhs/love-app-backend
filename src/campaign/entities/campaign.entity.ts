import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Provider } from '../../provider/entities/provider.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  category: string;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column('int')
  targetAmount: number;

  @Column('int', { default: 0 })
  currentAmount: number;

  @Column('int')
  volunteersNeeded: number;

  @Column('int', { default: 0 })
  volunteersRegistered: number;

  @Column({ default: 'active' })
  status: string;

  @Column('uuid')
  providerId: string;

  @ManyToOne(() => Provider, (provider) => provider.campaigns)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @CreateDateColumn()
  createdAt: Date;

  @Column('json')
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @UpdateDateColumn()
  updatedAt: Date;
}
