import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOW_GUEST_KEY } from '../decorators/allow-guest.decorator';

@Injectable()
export class GuestGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowGuest = this.reflector.getAllAndOverride<boolean>(ALLOW_GUEST_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return allowGuest || false;
  }
}