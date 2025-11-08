import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WifiVoucher } from './entities/wifi-voucher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WifiVoucher])],
  exports: [TypeOrmModule],
})
export class ConnectivityModule {}
