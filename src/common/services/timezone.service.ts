import { Injectable } from '@nestjs/common';
import moment from 'moment-timezone';

@Injectable()
export class TimezoneService {
  convertToTimezone(date: Date | string, timezone: string): string {
    return moment(date).tz(timezone).format();
  }

  convertToUTC(date: Date | string, timezone: string): Date {
    return moment.tz(date, timezone).utc().toDate();
  }

  getCurrentTimeInTimezone(timezone: string): string {
    return moment().tz(timezone).format();
  }

  formatDateForTimezone(
    date: Date | string,
    timezone: string,
    format: string = 'YYYY-MM-DD HH:mm:ss',
  ): string {
    return moment(date).tz(timezone).format(format);
  }

  getTimezoneOffset(timezone: string): number {
    return moment.tz(timezone).utcOffset();
  }

  isValidTimezone(timezone: string): boolean {
    return moment.tz.zone(timezone) !== null;
  }

  getSupportedTimezones(): string[] {
    return [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Mexico_City',
      'America/Sao_Paulo',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Madrid',
      'Europe/Rome',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Asia/Dubai',
      'Australia/Sydney',
      'Pacific/Auckland',
    ];
  }
}
