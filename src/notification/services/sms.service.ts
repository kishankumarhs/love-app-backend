import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { TemplateService } from './template.service';

@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);
  private twilioClient: Twilio;

  constructor(
    private configService: ConfigService,
    private templateService: TemplateService,
  ) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    
    if (accountSid && authToken) {
      this.twilioClient = new Twilio(accountSid, authToken);
    }
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.twilioClient) {
      this.logger.warn('Twilio not configured, SMS not sent');
      return false;
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to,
      });

      this.logger.log(`SMS sent successfully to ${to}, SID: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}`, error);
      return false;
    }
  }

  async sendTemplatedSMS(
    to: string,
    templateName: string,
    data: Record<string, any>,
  ): Promise<boolean> {
    try {
      const { content } = await this.templateService.renderTemplate(templateName, data);
      return await this.sendSMS(to, content);
    } catch (error) {
      this.logger.error(`Failed to send templated SMS to ${to}`, error);
      return false;
    }
  }

  async sendSOSAlert(
    to: string,
    location: string,
    emergencyType: string,
  ): Promise<boolean> {
    return await this.sendTemplatedSMS(to, 'sos_alert_sms', {
      location,
      emergencyType,
      timestamp: new Date().toLocaleString(),
    });
  }
}