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
import { Org } from './org.entity';

export enum UserRole {
  SEEKER = 'seeker',
  PROVIDER_ADMIN = 'provider_admin',
  PROVIDER_STAFF = 'provider_staff',
  ADMIN = 'admin',
  SUBADMIN = 'subadmin',
  VOLUNTEER = 'volunteer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
@Index(['role', 'status'])
@Index(['email'])
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: UserRole })
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @ApiProperty()
  @Column({ nullable: true })
  org_id: string;

  @ManyToOne(() => Org, { nullable: true })
  @JoinColumn({ name: 'org_id' })
  org: Org;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ApiProperty()
  @Column({ nullable: true })
  firstName: string;

  @ApiProperty()
  @Column({ nullable: true })
  lastName: string;

  @ApiProperty()
  @Column({ nullable: true })
  phone: string;

  @ApiProperty()
  @Column({ default: false })
  mfa: boolean;

  @ApiProperty({ enum: UserStatus })
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty()
  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 5, default: 'en' })
  language: string;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}