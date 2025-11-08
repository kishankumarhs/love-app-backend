import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class SavePaymentMethodDto {
  @ApiProperty()
  @IsString()
  stripePaymentMethodId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  setAsDefault?: boolean;
}
