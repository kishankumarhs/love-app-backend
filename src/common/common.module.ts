import { Module } from '@nestjs/common';
import { TimezoneService } from './services/timezone.service';
import { TimezoneInterceptor } from './interceptors/timezone.interceptor';
import { I18nController } from './controllers/i18n.controller';

@Module({
  providers: [TimezoneService, TimezoneInterceptor],
  controllers: [I18nController],
  exports: [TimezoneService, TimezoneInterceptor],
})
export class CommonModule {}
