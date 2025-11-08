import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Campaign } from '../../campaign/entities/campaign.entity';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  categories: string[];

  @Column('text')
  eligibility: string;

  @Column()
  address: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @Column()
  operatingHours: string;

  @Column('int')
  capacity: number;

  @Column()
  contactEmail: string;

  @Column()
  contactPhone: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Campaign, campaign => campaign.provider)
  campaigns: Campaign[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}