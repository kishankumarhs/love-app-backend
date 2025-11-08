import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsString()
  urgency: string;

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
  preferredContactMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
