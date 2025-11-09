import { IsString, IsNumber, IsOptional, IsObject, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSlotPolicyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  service_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  campaign_id?: string;

  @ApiProperty({ default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(240)
  slot_size?: number;

  @ApiProperty({ default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  max_per_slot?: number;

  @ApiProperty()
  @IsObject()
  operating_hours: Record<string, any>;

  @ApiProperty({ default: 60 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  booking_lead_time?: number;

  @ApiProperty({ default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cancel_cutoff?: number;
}

export class GetSlotsDto {
  @ApiProperty()
  @IsString()
  date: string; // YYYY-MM-DD format

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  service_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  campaign_id?: string;
}