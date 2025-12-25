import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Campaign } from '../../campaign/entities/campaign.entity';
import { Employee } from './employee.entity';

@Entity('providers')
export class Provider {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('text')
  email: string;

  @ApiProperty()
  @Column('simple-array')
  service_area: string[];

  @ApiProperty()
  @Column()
  organization: string;

  @ApiProperty()
  @Column('text')
  capabilities: string;

  @ApiProperty()
  @Column()
  website: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @ApiProperty()
  @Column('simple-array')
  documentLinks: string[];

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  operatingHours: string;

  @ApiProperty()
  @Column('int', { nullable: true })
  capacity: number;

  @ApiProperty()
  @Column({ nullable: true })
  contactEmail: string;

  @ApiProperty()
  @Column({ nullable: true })
  contactPhone: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  // ---------- RELATIONS ----------

  // Owning side of the Provider <-> User one-to-one relation.
  // Use lazy resolver and explicit JoinColumn to ensure the FK column
  // name is `userId` and no duplicate columns are created. Mark relation
  // nullable to avoid breaking existing provider rows with no user.
  @ApiHideProperty()
  @OneToOne(() => User, (user) => user.provider, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiHideProperty()
  @OneToMany(() => Campaign, (campaign) => campaign.provider)
  campaigns: Campaign[];

  @ApiHideProperty()
  @OneToMany(() => Employee, (employee) => employee.provider)
  employees: Employee[];

  // ---------- TIMESTAMPS ----------

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
