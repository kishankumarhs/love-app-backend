import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SlotsService } from './slots.service';
import { CreateSlotPolicyDto, GetSlotsDto } from './dto/slot.dto';
import { JwtAuthGuard, Roles } from '@love-app/auth';
import { UserRole } from '@love-app/common/entities/user.entity';
import { AllowGuest } from '@love-app/auth';

@ApiTags('Slots')
@Controller('slots')
export class SlotsController {
  constructor(private slotsService: SlotsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_STAFF)
  @Post('policy')
  @ApiOperation({ summary: 'Create or update slot policy' })
  @ApiResponse({ status: 201, description: 'Slot policy created/updated' })
  async createSlotPolicy(@Body() createSlotPolicyDto: CreateSlotPolicyDto) {
    return this.slotsService.createSlotPolicy(createSlotPolicyDto);
  }

  @AllowGuest()
  @Get()
  @ApiOperation({ summary: 'Get available slots for date' })
  @ApiResponse({ status: 200, description: 'Available slots' })
  async getSlots(@Query() getSlotsDto: GetSlotsDto) {
    return this.slotsService.getSlots(getSlotsDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/book')
  @ApiOperation({ summary: 'Book a slot' })
  @ApiResponse({ status: 200, description: 'Slot booked successfully' })
  async bookSlot(@Param('id') slotId: string) {
    return this.slotsService.bookSlot(slotId);
  }
}
