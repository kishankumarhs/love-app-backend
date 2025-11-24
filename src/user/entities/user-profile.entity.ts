import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ nullable: true })
  bio: string;

  @ApiProperty()
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty()
  @Column({ nullable: true })
  dateOfBirth: Date;

  @ApiProperty()
  @Column({ nullable: true })
  address: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @ApiProperty()
  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ApiProperty()
  @Column('json', { nullable: true })
  preferences: any;

  @ApiProperty()
  @Column({ nullable: true })
  religion: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
