import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
// path import removed — not needed for simple glob

export default registerAs('database', (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    // Disable automatic schema sync by default to avoid destructive ALTERs
    // Set TYPEORM_SYNCHRONIZE=true if you explicitly want sync enabled
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
    logging: process.env.NODE_ENV === 'development',
    retryAttempts: 10,
    retryDelay: 3000,
  };
});
