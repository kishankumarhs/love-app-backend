import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get<string>('MAIL_HOST'),
      port: configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: configService.get<string>('MAIL_USER'),
        pass: configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string, isHtml = true) {
    try {
      const result = await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to,
        subject,
        [isHtml ? 'html' : 'text']: body,
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendBulkEmail(recipients: string[], subject: string, body: string, isHtml = true) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendEmail(recipient, subject, body, isHtml);
      results.push({ recipient, ...result });
    }

    return results;
  }
}