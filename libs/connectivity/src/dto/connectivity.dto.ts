import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWifiTokenDto {
  @ApiProperty({ default: 3600 })
  @IsOptional()
  @IsNumber()
  @Min(300) // 5 minutes minimum
  @Max(86400) // 24 hours maximum
  ttl?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ValidateTokenDto {
  @ApiProperty()
  @IsString()
  token: string;
}