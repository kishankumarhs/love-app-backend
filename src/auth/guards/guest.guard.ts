import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GuestGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowGuest = this.reflector.getAllAndOverride<boolean>('allowGuest', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (allowGuest) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Guest users cannot access this resource');
    }

    return true;
  }
}
