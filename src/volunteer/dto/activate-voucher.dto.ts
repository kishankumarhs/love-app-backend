import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class ActivateVoucherDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  deviceInfo?: {
    macAddress?: string;
    deviceType?: string;
    userAgent?: string;
  };
}