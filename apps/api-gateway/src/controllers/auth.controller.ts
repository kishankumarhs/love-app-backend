import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() registerDto: any) {
    return { success: true, message: 'User registered' };
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: any) {
    return { success: true, token: 'jwt-token' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  async refresh(@Body() refreshDto: any) {
    return { success: true, token: 'new-jwt-token' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Req() req: any) {
    return { success: true, user: { id: '1', email: 'user@example.com' } };
  }
}
