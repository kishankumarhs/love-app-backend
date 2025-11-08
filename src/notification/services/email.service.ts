import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { TemplateService } from './template.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private templateService: TemplateService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    content: string,
    isHtml: boolean = true,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('MAIL_FROM'),
        to,
        subject,
        [isHtml ? 'html' : 'text']: content,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return false;
    }
  }

  async sendTemplatedEmail(
    to: string,
    templateName: string,
    data: Record<string, any>,
  ): Promise<boolean> {
    try {
      const { subject, content } = await this.templateService.renderTemplate(templateName, data);
      return await this.sendEmail(to, subject || 'Notification', content);
    } catch (error) {
      this.logger.error(`Failed to send templated email to ${to}`, error);
      return false;
    }
  }

  async sendSOSAlert(
    to: string,
    location: string,
    emergencyType: string,
    description: string,
  ): Promise<boolean> {
    return await this.sendTemplatedEmail(to, 'sos_alert_email', {
      location,
      emergencyType,
      description,
      timestamp: new Date().toLocaleString(),
    });
  }

  async sendDonationConfirmation(
    to: string,
    campaignTitle: string,
    amount: number,
    transactionId: string,
  ): Promise<boolean> {
    return await this.sendTemplatedEmail(to, 'campaign_donation_email', {
      campaignTitle,
      amount,
      transactionId,
      date: new Date().toLocaleDateString(),
    });
  }

  async sendVolunteerAssignment(
    to: string,
    assignmentType: string,
    description: string,
    location: string,
    scheduledAt: Date,
  ): Promise<boolean> {
    return await this.sendTemplatedEmail(to, 'volunteer_assignment_email', {
      assignmentType,
      description,
      location,
      scheduledAt: scheduledAt.toLocaleString(),
    });
  }
}