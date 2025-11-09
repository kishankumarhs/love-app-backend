import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth login' })
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req) {
    return this.authService.socialLogin(req.user);
  }

  @Public()
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Apple OAuth login' })
  async appleAuth() {
    // Initiates Apple OAuth flow
  }

  @Public()
  @Get('apple/callback')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Apple OAuth callback' })
  async appleAuthCallback(@Req() req) {
    return this.authService.socialLogin(req.user);
  }
}
