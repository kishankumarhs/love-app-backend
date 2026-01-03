import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Provider } from '../../provider/entities/provider.entity';
import { Employee } from '../../provider/entities/employee.entity';

/**
 * Campaign Entity (Donation Drives)
 * - MVP Rule: Campaigns are created/managed by ADMINs only.
 * - Mobile App: Users can VIEW campaigns and DONATE to them.
 * - Mobile users cannot create campaigns.
 */
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

  // Provider relation: Campaigns many-to-one -> owning side is Campaign.
  // This will create `providerId` FK in the `campaigns` table; the column
  // name must match existing DB schema (provider_id in migrations), so we
  // set the join column name explicitly if needed elsewhere.
  @ManyToOne(() => Provider, (provider) => provider.campaigns, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  provider: Provider;

  // ✅ Campaign ↔ Employee (Many-to-Many)
  // Many-to-many relation between Campaign and Employee with explicit
  // join table `campaign_employees`. Using explicit JoinTable prevents
  // TypeORM from creating unexpected columns. Keep the join table
  // definition consistent with DB migration `campaign_employees`.
  @ManyToMany(() => Employee, (employee) => employee /* no inverse */)
  @JoinTable({
    name: 'campaign_employees',
    joinColumn: {
      name: 'campaign_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'employee_id',
      referencedColumnName: 'id',
    },
  })
  employees: Employee[];

  @Column('json')
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
