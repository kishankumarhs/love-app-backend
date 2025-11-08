import {
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  targetAmount: number;

  @IsNumber()
  volunteersNeeded: number;

  @IsUUID()
  providerId: string;

  @IsOptional()
  @IsString()
  status?: string;
}
