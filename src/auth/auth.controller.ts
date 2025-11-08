import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

export class VerifyEmailDto {
  token: string;
}
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AllowGuest } from './decorators/allow-guest.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @AllowGuest()
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async signUp(@Body() signUpDto: RegisterDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  @AllowGuest()
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @AllowGuest()
  @ApiOperation({ summary: 'Google OAuth login' })
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @AllowGuest()
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }

  @Post('verify-email')
  @AllowGuest()
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const isVerified = await this.authService.verifyEmail(verifyEmailDto.token);
    return { verified: isVerified };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Req() req) {
    return req.user;
  }
}
