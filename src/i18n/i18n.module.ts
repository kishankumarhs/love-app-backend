import { Module } from '@nestjs/common';
import {
  I18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/translations/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        { use: HeaderResolver, options: ['accept-language'] },
        AcceptLanguageResolver,
      ],
      typesOutputPath: path.join(__dirname, '../generated/i18n.generated.ts'),
    }),
  ],
  exports: [I18nModule],
})
export class I18nCustomModule {}
