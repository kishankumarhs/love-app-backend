import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class GuestSOSDto {
  @IsString()
  guestPhone: string;

  @IsString()
  guestName: string;

  @IsString()
  emergencyType: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  requiresEmergencyCall?: boolean;
}