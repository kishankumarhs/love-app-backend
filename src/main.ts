import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security middleware
  // Strip '/api' prefix from incoming requests (useful when reverse proxy adds it)
  app.use((req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.url && req.url.startsWith('/api')) {
        req.url = req.url.replace(/^\/api/, '') || '/';
        if (req.originalUrl)
          req.originalUrl = req.originalUrl.replace(/^\/api/, '') || '/';
      }
    } catch (e) {
      // noop - don't break requests if something unexpected happens
    }
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
          ? {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'"],
              fontSrc: ["'self'", 'data:'],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'none'"],
            },
          }
          : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(compression());

  // Global pipes with security
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new (AnyFilesInterceptor())(),
  );

  // CORS with security
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? (process.env.ALLOWED_ORIGINS || 'https://lovesolutions.cloud').split(
          ',',
        )
        : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:8080',
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-API-Key',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
    maxAge: 86400,
  });

  // OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('LOVE App API')
    .setDescription(
      'Backend API for LOVE App - Service-oriented application for providers, campaigns, SOS calls, donations, volunteers, and user management',
    )
    .setVersion('1.0.0')
    .setContact('LOVE App Team', 'https://loveapp.com', 'support@loveapp.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://lovesolutions.cloud/api', 'Production server')
    .addServer(
      `http://${process.env.HOST || 'localhost'}:${configService.get<number>('app.port') || 3000}`,
      'Current server',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Providers', 'Service provider endpoints')
    .addTag('Campaigns', 'Campaign management endpoints')
    .addTag('SOS', 'Emergency SOS endpoints')
    .addTag('Donations', 'Payment and donation endpoints')
    .addTag('Volunteers', 'Volunteer management endpoints')
    .addTag('Reviews', 'Review and feedback endpoints')
    .addTag('Notifications', 'Notification endpoints')
    .addTag('Admin', 'Administrative endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'LOVE App API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    });
  });

  // Handle favicon.ico to prevent 404s
  app.getHttpAdapter().get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });

  const port = configService.get<number>('app.port') || 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  logger.log(`🚀 Application is running on: http://${host}:${port}`);
  logger.log(`📚 Swagger documentation: http://${host}:${port}/api/docs`);
  logger.log(`🏥 Health check: http://${host}:${port}/health`);
  logger.log(
    `🔒 Security features enabled: Helmet, CORS, Rate Limiting, Validation`,
  );
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
