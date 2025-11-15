import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNumber,
  IsInt,
  Min,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+1234567890' })
  @IsNumber()
  @IsInt({ message: 'Price must be an integer.' })
  @Min(0, { message: 'Price cannot be negative.' })
  age: number;

  @ApiProperty({ example: 'USA' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Christianity' })
  @IsString()
  religion: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: UserRole.USER, enum: UserRole })
  @IsString()
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;
}
