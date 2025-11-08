import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private authService: ClientProxy) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() registerDto: any) {
    return this.authService.send('auth.register', registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: any) {
    return this.authService.send('auth.login', loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  async refresh(@Body() refreshDto: any) {
    return this.authService.send('auth.refresh', refreshDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Req() req: any) {
    return this.authService.send('auth.profile', { userId: req.user.id });
  }
}
