import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/user/entities/user.entity';

export class FirebaseAuthDto {
  @ApiProperty({
    description: 'Firebase ID token from client',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsString()
  idToken: string;

  @ApiProperty({
    description: 'User role for authentication',
    example: 'seeker',
    enumName: 'UserRole',
    enum: UserRole,
  })
  @IsString()
  @IsEnum(UserRole)
  role: UserRole;
}
