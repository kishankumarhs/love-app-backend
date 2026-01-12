import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  IsNumber,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class CreateProvider {
  @ApiProperty({ example: 'John' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'providers@loveapp.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ example: '1787df61-8383-4dd8-8743-b4ea9ba5219c' })
  @IsString()
  userId: string;

  @ApiProperty({ example: ['New York', 'Los Angeles'] })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  service_area: string[];

  @ApiProperty({ example: 'Helping Hands Organization' })
  @IsString()
  organization: string;

  @ApiProperty({ example: 'We provide food and shelter services.' })
  @IsString()
  capabilities: string;

  @ApiProperty({ example: 'https://www.helpinghands.org' })
  @IsString()
  website: string;

  @ApiProperty({ example: 40.712776 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -74.005974 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @ApiProperty({
    example: ['https://linktodocument1.com', 'https://linktodocument2.com'],
  })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  documentLinks: string[];
}
