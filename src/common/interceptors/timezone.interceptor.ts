import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TimezoneService } from '../services/timezone.service';

@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  constructor(private readonly timezoneService: TimezoneService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const timezone = request.headers['x-timezone'] || 'UTC';

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object') {
          return this.convertDatesToTimezone(data, timezone);
        }
        return data;
      }),
    );
  }

  private convertDatesToTimezone(obj: any, timezone: string): any {
    if (obj instanceof Date) {
      return this.timezoneService.convertToTimezone(obj, timezone);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertDatesToTimezone(item, timezone));
    }

    if (obj && typeof obj === 'object') {
      const converted = {};
      for (const [key, value] of Object.entries(obj)) {
        if (this.isDateField(key) && value) {
          converted[key] = this.timezoneService.convertToTimezone(
            value as Date,
            timezone,
          );
        } else if (typeof value === 'object') {
          converted[key] = this.convertDatesToTimezone(value, timezone);
        } else {
          converted[key] = value;
        }
      }
      return converted;
    }

    return obj;
  }

  private isDateField(fieldName: string): boolean {
    const dateFields = [
      'createdAt',
      'updatedAt',
      'deletedAt',
      'startDate',
      'endDate',
      'appointmentDate',
      'completedAt',
      'resolvedAt',
      'reviewedAt',
      'contactedAt',
      'dateOfBirth',
    ];
    return dateFields.includes(fieldName);
  }
}