import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsDateString,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  SanitizeHtml,
  NormalizeEmail,
} from '../../common/validators/sanitize.validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @NormalizeEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'Password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @SanitizeHtml()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @SanitizeHtml()
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number' })
  phone: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'Please provide a valid date of birth' })
  dateOfBirth: string;

  @ApiProperty({
    example: 'America/New_York',
    description: 'User timezone',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    example: 'en',
    description: 'Preferred language',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  language?: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @NormalizeEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'User password' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token',
  })
  @IsString()
  refreshToken: string;
}
