import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('campaigns')
export class Campaign {
  @ManyToMany('Employee', () => Object, { cascade: false })
  @JoinTable({
    name: 'campaign_employees',
    joinColumn: { name: 'campaignId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'employeeId', referencedColumnName: 'id' },
  })
  employees: any[];
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

  @ManyToOne('Provider', (provider: any) => provider.campaigns)
  @JoinColumn({ name: 'providerId' })
  provider: any;

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
