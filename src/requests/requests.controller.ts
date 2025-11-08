import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  createRequest(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.createRequest(createRequestDto);
  }

  @Get()
  findAllRequests(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('userId') userId?: string,
  ) {
    return this.requestsService.findAllRequests({ status, category, userId });
  }

  @Get(':id')
  findOneRequest(@Param('id') id: string) {
    return this.requestsService.findOneRequest(id);
  }

  @Patch(':id')
  updateRequest(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestsService.updateRequest(id, updateRequestDto);
  }

  @Delete(':id')
  deleteRequest(@Param('id') id: string) {
    return this.requestsService.deleteRequest(id);
  }

  @Post('referrals')
  createReferral(@Body() createReferralDto: CreateReferralDto) {
    return this.requestsService.createReferral(createReferralDto);
  }

  @Get(':requestId/referrals')
  findReferralsByRequest(@Param('requestId') requestId: string) {
    return this.requestsService.findReferralsByRequest(requestId);
  }

  @Patch('referrals/:id')
  updateReferral(
    @Param('id') id: string,
    @Body() updateReferralDto: UpdateReferralDto,
  ) {
    return this.requestsService.updateReferral(id, updateReferralDto);
  }

  @Get('user/:userId/referrals')
  getReferralHistory(@Param('userId') userId: string) {
    return this.requestsService.getReferralHistory(userId);
  }
}
