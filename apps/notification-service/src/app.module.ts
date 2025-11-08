import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@app/shared';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { WebSocketService } from './websocket.service';
import { Notification } from './entities/notification.entity';
import { CacheService } from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    TypeOrmModule.forFeature([Notification]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, WebSocketService, CacheService],
})
export class AppModule {}
