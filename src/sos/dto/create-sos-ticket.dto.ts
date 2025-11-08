import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID } from 'class-validator';

export class CreateSOSTicketDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  guestPhone?: string;

  @IsOptional()
  @IsString()
  guestName?: string;

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
  @IsString()
  priority?: string;

  @IsOptional()
  @IsBoolean()
  requiresEmergencyCall?: boolean;
}