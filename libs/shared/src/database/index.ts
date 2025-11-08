import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'loveapp',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  retryAttempts: 10,
  retryDelay: 3000,
  extra: {
    max: 100,
    min: 10,
    acquire: 30000,
    idle: 10000,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
  poolSize: 100,
});

export const getReadOnlyDatabaseConfig = (): TypeOrmModuleOptions => ({
  ...getDatabaseConfig(),
  host:
    process.env.DATABASE_READ_HOST || process.env.DATABASE_HOST || 'localhost',
  name: 'readonly',
});
