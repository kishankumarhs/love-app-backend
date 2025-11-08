import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LocationPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredAreas?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  maxDistance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transportationMode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableRegions?: string[];
}

class ReferenceDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsString()
  relationship: string;
}

export class CreateVolunteerApplicationDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationPreferencesDto)
  locationPreferences?: LocationPreferencesDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motivation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  references?: ReferenceDto[];
}