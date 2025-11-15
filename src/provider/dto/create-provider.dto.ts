import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNumber, IsEmail } from 'class-validator';

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

  @ApiProperty({ example: 'USA' })
  @IsString()
  country: string;

  @ApiProperty({ example: 40.712776 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -74.005974 })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    example: ['https://linktodocument1.com', 'https://linktodocument2.com'],
  })
  @IsArray()
  documentLinks: string[];
}
