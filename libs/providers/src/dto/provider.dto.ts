import {
  IsString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrgKind } from '@love-app/common/entities/org.entity';

export class CreateProviderDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  longitude: number;

  @ApiProperty({ enum: OrgKind, default: OrgKind.PROVIDER })
  @IsOptional()
  @IsEnum(OrgKind)
  kind?: OrgKind;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  domain?: string;
}

export class SearchProvidersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  radius?: number; // in kilometers

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  openNow?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  hasCapacity?: boolean;
}

export class AddEmployeeDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ default: 'provider_staff' })
  @IsOptional()
  @IsString()
  role?: string;
}
