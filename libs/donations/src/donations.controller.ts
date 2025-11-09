import { Controller, Post, Body, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import { CreateStripeCheckoutDto, CreatePayPalOrderDto } from './dto/donation.dto';
import { JwtAuthGuard } from '@love-app/auth';
import { AllowGuest } from '@love-app/auth';

@ApiTags('Donations')
@Controller('donations')
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @AllowGuest()
  @Post('stripe/checkout')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  async createStripeCheckout(@Body() createStripeCheckoutDto: CreateStripeCheckoutDto, @Req() req) {
    const userId = req.user?.id;
    return this.donationsService.createStripeCheckout(createStripeCheckoutDto, userId);
  }

  @AllowGuest()
  @Post('paypal/order')
  @ApiOperation({ summary: 'Create PayPal order' })
  @ApiResponse({ status: 201, description: 'PayPal order created' })
  async createPayPalOrder(@Body() createPayPalOrderDto: CreatePayPalOrderDto, @Req() req) {
    const userId = req.user?.id;
    return this.donationsService.createPayPalOrder(createPayPalOrderDto, userId);
  }

  @Post('paypal/capture/:orderId')
  @ApiOperation({ summary: 'Capture PayPal order' })
  @ApiResponse({ status: 200, description: 'PayPal order captured' })
  async capturePayPalOrder(@Param('orderId') orderId: string) {
    return this.donationsService.capturePayPalOrder(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('history')
  @ApiOperation({ summary: 'Get donation history' })
  @ApiResponse({ status: 200, description: 'Donation history retrieved' })
  async getDonationHistory(@Req() req) {
    return this.donationsService.getDonationHistory(req.user.id);
  }

  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook' })
  async handleStripeWebhook(@Body() event: any) {
    return this.donationsService.handleStripeWebhook(event);
  }
}