import {
  IsString,
  IsArray,
  IsNumber,
  IsEmail,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateProviderDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsString()
  eligibility: string;

  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  operatingHours: string;

  @IsNumber()
  capacity: number;

  @IsEmail()
  contactEmail: string;

  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
