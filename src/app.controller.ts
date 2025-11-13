import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { Countries } from './user/entities/countires.entity';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Basic health check',
    description: 'Returns a simple message to verify the service is running',
    operationId: 'getHello',
  })
  @ApiOkResponse({
    description: 'Service is running successfully',
    schema: {
      type: 'string',
      example: 'LOVE App Backend API is running!',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Detailed health status',
    description:
      'Returns detailed health information including timestamp and service name',
    operationId: 'getHealthStatus',
  })
  @ApiOkResponse({
    description: 'Detailed health status',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          description: 'Service status',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
          description: 'Current timestamp',
        },
        service: {
          type: 'string',
          example: 'LOVE App Backend',
          description: 'Service name',
        },
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'LOVE App Backend',
    };
  }

  @Get('country-list')
  @ApiOperation({ summary: 'Create user profile' })
  @ApiResponse({ status: 201, type: Countries })
  getCountries() {
    return this.appService.getCountries();
  }
}
