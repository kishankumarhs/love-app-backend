import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use IP address and user ID (if authenticated) for tracking
    const ip = req.ip || req.connection.remoteAddress;
    const userId = req.user?.id;
    return userId ? `${ip}-${userId}` : ip;
  }

  protected async getErrorMessage(): Promise<string> {
    return 'Too many requests. Please try again later.';
  }
}
