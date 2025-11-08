import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { FeedbackType, FeedbackStatus } from '../entities/feedback.entity';

export class CreateFeedbackDto {
  @ApiProperty({ enum: FeedbackType })
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsUUID()
  userId: string;
}

export class UpdateFeedbackDto {
  @ApiPropertyOptional({ enum: FeedbackStatus })
  @IsOptional()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus;
}