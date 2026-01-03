import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Provider } from '../../provider/entities/provider.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { WifiVoucher } from '../../volunteer/entities/wifi-voucher.entity';

export enum UserRole {
  USER = 'user',
  PROVIDER = 'provider',
  /**
   * Volunteer is a role/flag on the User entity.
   * It is NOT a standalone system. Volunteers are managed by Admins.
   */
  VOLUNTEER = 'volunteer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * User Entity
 * Core identity for all system users including Providers, Volunteers, and Admins.
 * - Role-based access control rules applies via `role` field.
 * - Volunteers are Users with `role: VOLUNTEER`.
 */
@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  @Column({ nullable: true })
  country: string;

  @ApiProperty()
  @Column({ nullable: true })
  age: number;

  @ApiProperty()
  @Column({ nullable: true })
  religion: string;

  @ApiProperty({ enum: UserRole })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty()
  @Column({ default: false })
  isEmailVerified: boolean;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 5, default: 'en' })
  language: string;

  // Optional geolocation for users (nullable). Added to simplify nearby
  // searches without a separate profile table.
  @ApiPropertyOptional()
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude?: number;

  @ApiPropertyOptional()
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude?: number;

  // Inverse side of Provider <-> User. Keep hidden from Swagger to avoid
  // circular schema expansion. This side must not declare @JoinColumn
  // (the owning side is Provider) and should reference the relation property.
  @ApiHideProperty()
  @OneToOne(() => Provider, (provider) => provider.user)
  provider: Provider;

  @OneToMany(() => WifiVoucher, (voucher) => voucher.user)
  vochers: WifiVoucher[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
