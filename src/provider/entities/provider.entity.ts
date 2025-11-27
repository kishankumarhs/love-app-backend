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
import { User } from 'src/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

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

  @Column('int', { nullable: true })
  capacity: number;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @OneToOne(() => User, (user: any) => user.provider)
  @JoinColumn()
  userId: string;

  @ApiProperty()
  @OneToMany('Campaign', (campaign: any) => campaign.provider)
  @JoinColumn()
  campaigns: any[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
