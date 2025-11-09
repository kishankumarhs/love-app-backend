import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayPalService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = configService.get<string>(
      'PAYPAL_BASE_URL',
      'https://api-m.sandbox.paypal.com',
    );
    this.clientId = configService.get<string>('PAYPAL_CLIENT_ID');
    this.clientSecret = configService.get<string>('PAYPAL_CLIENT_SECRET');
  }

  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
  }

  async createOrder(
    amount: number,
    currency = 'USD',
    returnUrl: string,
    cancelUrl: string,
  ) {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              brand_name: 'Love App',
              locale: 'en-US',
              landing_page: 'LOGIN',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              return_url: returnUrl,
              cancel_url: cancelUrl,
            },
          },
        },
      }),
    });

    return response.json();
  }

  async captureOrder(orderId: string) {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.json();
  }
}
