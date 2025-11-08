import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateReferralDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  responseReceived?: boolean;

  @IsOptional()
  @IsString()
  providerResponse?: string;

  @IsOptional()
  @IsDateString()
  appointmentDate?: string;
}
