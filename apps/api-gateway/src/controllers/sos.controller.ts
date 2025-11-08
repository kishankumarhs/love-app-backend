import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('SOS')
@Controller('sos')
export class SOSController {
  @Post()
  async createSOS(@Body() data: any) {
    return { success: true, message: 'SOS created', id: '1' };
  }
}
