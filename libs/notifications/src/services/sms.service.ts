import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private accountSid: string;
  private authToken: string;
  private phoneNumber: string;
  private client: any;

  constructor(private configService: ConfigService) {
    this.accountSid = configService.get<string>('TWILIO_ACCOUNT_SID');
    this.authToken = configService.get<string>('TWILIO_AUTH_TOKEN');
    this.phoneNumber = configService.get<string>('TWILIO_PHONE_NUMBER');

    if (this.accountSid && this.authToken) {
      // Dynamically import Twilio to avoid issues if not installed
      try {
        const twilio = require('twilio');
        this.client = twilio(this.accountSid, this.authToken);
      } catch (error) {
        console.warn('Twilio not available:', error.message);
      }
    }
  }

  async sendSms(to: string, body: string) {
    if (!this.client) {
      return {
        success: false,
        error: 'SMS service not configured',
      };
    }

    try {
      const message = await this.client.messages.create({
        body,
        from: this.phoneNumber,
        to,
      });

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendBulkSms(recipients: string[], body: string) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendSms(recipient, body);
      results.push({ recipient, ...result });
    }

    return results;
  }
}