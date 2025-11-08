import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TimezoneService } from '../services/timezone.service';

@ApiTags('Internationalization')
@Controller('i18n')
export class I18nController {
  constructor(private readonly timezoneService: TimezoneService) {}

  @Get('timezones')
  @ApiOperation({ summary: 'Get supported timezones' })
  @ApiResponse({ status: 200, description: 'List of supported timezones' })
  getSupportedTimezones() {
    return {
      timezones: this.timezoneService.getSupportedTimezones(),
      default: 'UTC',
    };
  }

  @Get('languages')
  @ApiOperation({ summary: 'Get supported languages' })
  @ApiResponse({ status: 200, description: 'List of supported languages' })
  getSupportedLanguages() {
    return {
      languages: [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
      ],
      default: 'en',
    };
  }

  @Get('time')
  @ApiOperation({ summary: 'Get current time in specified timezone' })
  @ApiQuery({ name: 'timezone', required: false, example: 'America/New_York' })
  @ApiResponse({ status: 200, description: 'Current time in specified timezone' })
  getCurrentTime(@Query('timezone') timezone: string = 'UTC') {
    if (!this.timezoneService.isValidTimezone(timezone)) {
      timezone = 'UTC';
    }
    
    return {
      timezone,
      currentTime: this.timezoneService.getCurrentTimeInTimezone(timezone),
      utcTime: new Date().toISOString(),
      offset: this.timezoneService.getTimezoneOffset(timezone),
    };
  }
}