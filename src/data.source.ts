import { DataSource } from 'typeorm';
import { Countries } from './user/entities/countires.entity';
import { CreateCountriesAndSeedData1731500000000 } from './migrations/1731500000000-CreateCountriesAndSeedData';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: process.env.DATABASE_NAME,
  entities: [Countries],
  migrations: [CreateCountriesAndSeedData1731500000000],
});
