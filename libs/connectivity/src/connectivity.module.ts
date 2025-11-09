import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WifiToken } from './entities/wifi-token.entity';
import { ConnectivityService } from './connectivity.service';
import { ConnectivityController } from './connectivity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WifiToken])],
  providers: [ConnectivityService],
  controllers: [ConnectivityController],
  exports: [ConnectivityService],
})
export class ConnectivityModule {}