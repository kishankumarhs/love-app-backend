import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: any) {
    return this.authService.register(data);
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: any) {
    return this.authService.login(data);
  }

  @MessagePattern('auth.refresh')
  async refresh(@Payload() data: any) {
    return this.authService.refreshToken(data);
  }

  @MessagePattern('auth.profile')
  async getProfile(@Payload() data: { userId: string }) {
    return this.authService.getProfile(data.userId);
  }

  @MessagePattern('auth.validate')
  async validateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }
}