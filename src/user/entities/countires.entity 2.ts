import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('countries')
export class Countries {
  @Column()
  @PrimaryGeneratedColumn('uuid')
  id: number;
  @Column({ type: 'varchar', length: 100 })
  name: string;
  @Column({ type: 'varchar', length: 10 })
  countryCode: string;
}
