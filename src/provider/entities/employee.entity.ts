import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Provider } from './provider.entity';
import { Campaign } from '../../campaign/entities/campaign.entity';
import { ManyToMany } from 'typeorm';

@Entity('employees')
export class Employee {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  email: string;

  @ApiProperty()
  @Column({ nullable: true })
  phone: string;

  @ApiProperty()
  @Column({ nullable: true })
  position: string;

  // Employee -> Provider is a ManyToOne owning side. This will create
  // a providerId FK column in the employees table. Mark nullable true
  // if historical employees may not be linked.
  @ApiHideProperty()
  @ManyToOne(() => Provider, (provider) => provider.employees, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  provider: Provider;

  // Inverse side of Campaign <-> Employee many-to-many. Hidden from
  // Swagger to avoid circular schema expansion.
  @ApiHideProperty()
  @ManyToMany(() => Campaign, (campaign) => campaign.employees)
  campaigns: Campaign[];

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
