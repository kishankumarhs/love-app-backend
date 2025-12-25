import {
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsOptional,
  Allow,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Campaign title',
    example: 'Help Local Families',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Campaign description',
    example: 'Supporting families in need during difficult times',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Campaign category',
    example: 'Community Support',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Campaign start date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Campaign end date',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Target amount in cents', example: 100000 })
  @IsNumber()
  targetAmount: number;

  @ApiProperty({ description: 'Number of volunteers needed', example: 10 })
  @IsNumber()
  volunteersNeeded: number;

  @ApiProperty({
    description: 'Provider UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  providerId: string;

  @ApiPropertyOptional({
    description: 'Campaign status',
    example: 'active',
    default: 'active',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Campaign location coordinates',
    example: { type: 'Point', coordinates: [-74.006, 40.7128] },
  })
  @ApiProperty({
    description: 'Campaign location in GeoJSON format',
    example: {
      type: 'Point',
      coordinates: [-74.006, 40.7128], // [longitude, latitude]
    },
  })
  @Allow()
  location: {
    type: 'Point'; // GeoJSON type must be capitalized
    coordinates: [number, number]; // [longitude, latitude]
  };
}
