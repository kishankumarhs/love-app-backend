import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { AdminActionType } from '../entities/admin-action.entity';

export class CreateAdminActionDto {
  @ApiProperty({ enum: AdminActionType })
  @IsEnum(AdminActionType)
  actionType: AdminActionType;

  @ApiProperty()
  @IsString()
  targetType: string;

  @ApiProperty()
  @IsUUID()
  targetId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UserManagementDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: ['suspend', 'activate', 'delete'] })
  @IsEnum(['suspend', 'activate', 'delete'])
  action: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ProviderManagementDto {
  @ApiProperty()
  @IsUUID()
  providerId: string;

  @ApiProperty({ enum: ['approve', 'reject', 'suspend'] })
  @IsEnum(['approve', 'reject', 'suspend'])
  action: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
