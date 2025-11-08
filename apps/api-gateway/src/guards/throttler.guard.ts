import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ip || req.connection.remoteAddress;
    const userId = req.user?.id;
    return userId ? `${ip}-${userId}` : ip;
  }

  protected async getErrorMessage(): Promise<string> {
    return 'Rate limit exceeded. Please try again later.';
  }
}