import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Provider } from '../../provider/entities/provider.entity';

@Entity('reviews')
export class Review {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('int')
  rating: number;

  @ApiProperty()
  @Column('text', { nullable: true })
  comment: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Provider)
  @JoinColumn()
  provider: Provider;

  @Column()
  providerId: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}