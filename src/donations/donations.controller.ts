import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DonationsService } from './donations.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { SavePaymentMethodDto } from './dto/save-payment-method.dto';
import { StripeService } from './services/stripe.service';

@ApiTags('donations')
@Controller('donations')
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent for donation' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @Request() req,
  ) {
    return this.donationsService.createPaymentIntent({
      ...createPaymentIntentDto,
      userId: req.user.id,
    });
  }

  @Post('confirm/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm donation payment' })
  @ApiResponse({ status: 200, description: 'Donation confirmed successfully' })
  async confirmDonation(@Param('id') id: string) {
    return this.donationsService.confirmDonation(id);
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create refund for donation' })
  @ApiResponse({ status: 201, description: 'Refund created successfully' })
  async createRefund(@Body() createRefundDto: CreateRefundDto) {
    return this.donationsService.createRefund(createRefundDto);
  }

  @Post('payment-methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save payment method' })
  @ApiResponse({ status: 201, description: 'Payment method saved successfully' })
  async savePaymentMethod(
    @Body() savePaymentMethodDto: SavePaymentMethodDto,
    @Request() req,
  ) {
    return this.donationsService.savePaymentMethod(req.user.id, savePaymentMethodDto);
  }

  @Get('payment-methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getUserPaymentMethods(@Request() req) {
    return this.donationsService.getUserPaymentMethods(req.user.id);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get donation history' })
  @ApiResponse({ status: 200, description: 'Donation history retrieved successfully' })
  async getDonationHistory(
    @Request() req,
    @Query('campaignId') campaignId?: string,
  ) {
    return this.donationsService.getDonationHistory(req.user.id, campaignId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get donation by ID' })
  @ApiResponse({ status: 200, description: 'Donation retrieved successfully' })
  async getDonationById(@Param('id') id: string) {
    return this.donationsService.getDonationById(id);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const payload = req.rawBody.toString();
    const event = this.stripeService.constructWebhookEvent(payload, signature);
    
    await this.donationsService.handleWebhookEvent(event);
    
    return { received: true };
  }
}