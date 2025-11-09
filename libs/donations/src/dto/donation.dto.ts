import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DonationProvider } from '@love-app/common/entities/donation.entity';

export class CreateDonationDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: DonationProvider })
  @IsEnum(DonationProvider)
  provider: DonationProvider;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  campaign_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  provider_org_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class CreateStripeCheckoutDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty()
  @IsString()
  success_url: string;

  @ApiProperty()
  @IsString()
  cancel_url: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  campaign_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  provider_org_id?: string;
}

export class CreatePayPalOrderDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty()
  @IsString()
  return_url: string;

  @ApiProperty()
  @IsString()
  cancel_url: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  campaign_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  provider_org_id?: string;
}