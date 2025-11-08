import { IsString, IsOptional, IsUUID, IsBoolean, IsDateString } from 'class-validator';

export class CreateReferralDto {
  @IsUUID()
  requestId: string;

  @IsUUID()
  providerId: string;

  @IsUUID()
  referredBy: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  appointmentDate?: string;
}