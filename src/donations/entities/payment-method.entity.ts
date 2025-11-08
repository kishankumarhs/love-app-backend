import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

@Entity('payment_methods')
export class PaymentMethod {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ApiProperty()
  @Column()
  stripePaymentMethodId: string;

  @ApiProperty()
  @Column({ default: 'card' })
  type: string;

  @ApiProperty()
  @Column({ nullable: true, length: 4 })
  lastFour: string;

  @ApiProperty()
  @Column({ nullable: true })
  brand: string;

  @ApiProperty()
  @Column({ nullable: true })
  expMonth: number;

  @ApiProperty()
  @Column({ nullable: true })
  expYear: number;

  @ApiProperty()
  @Column({ default: false })
  isDefault: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}