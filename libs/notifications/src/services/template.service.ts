import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Handlebars from 'handlebars';

import { NotificationTemplate } from '../entities/notification-template.entity';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
  ) {}

  async getTemplate(key: string): Promise<NotificationTemplate> {
    return this.templateRepository.findOne({
      where: { key, active: true },
    });
  }

  async renderTemplate(template: NotificationTemplate, variables: Record<string, any>) {
    const subjectTemplate = Handlebars.compile(template.subject);
    const bodyTemplate = Handlebars.compile(template.body);

    return {
      subject: subjectTemplate(variables),
      body: bodyTemplate(variables),
    };
  }

  async createTemplate(templateData: Partial<NotificationTemplate>) {
    const template = this.templateRepository.create(templateData);
    return this.templateRepository.save(template);
  }

  async seedDefaultTemplates() {
    const defaultTemplates = [
      {
        key: 'sos_alert',
        name: 'SOS Alert',
        type: 'email',
        category: 'sos',
        subject: 'Emergency SOS Alert - {{location}}',
        body: `
          <h2>Emergency SOS Alert</h2>
          <p>An emergency SOS has been triggered:</p>
          <ul>
            <li><strong>Location:</strong> {{location}}</li>
            <li><strong>Time:</strong> {{timestamp}}</li>
            <li><strong>User:</strong> {{userName}}</li>
            <li><strong>Phone:</strong> {{userPhone}}</li>
          </ul>
          <p>Please respond immediately.</p>
        `,
        variables: ['location', 'timestamp', 'userName', 'userPhone'],
      },
      {
        key: 'referral_accepted',
        name: 'Referral Accepted',
        type: 'email',
        category: 'referral',
        subject: 'Your referral has been accepted',
        body: `
          <h2>Referral Accepted</h2>
          <p>Good news! Your referral to {{providerName}} has been accepted.</p>
          <p><strong>Service:</strong> {{serviceName}}</p>
          <p><strong>Scheduled for:</strong> {{scheduledDate}}</p>
          <p>Please arrive on time. If you need to cancel, please contact us at least 30 minutes before your appointment.</p>
        `,
        variables: ['providerName', 'serviceName', 'scheduledDate'],
      },
      {
        key: 'donation_received',
        name: 'Donation Received',
        type: 'email',
        category: 'donation',
        subject: 'Thank you for your donation!',
        body: `
          <h2>Thank You for Your Donation!</h2>
          <p>We have received your generous donation of $\{\{amount\}\}.</p>
          <p><strong>Campaign:</strong> \{\{campaignName\}\}</p>
          <p><strong>Date:</strong> \{\{donationDate\}\}</p>
          <p>Your support makes a real difference in our community. Thank you!</p>
        `,
        variables: ['amount', 'campaignName', 'donationDate'],
      },
    ];

    for (const templateData of defaultTemplates) {
      const existing = await this.templateRepository.findOne({
        where: { key: templateData.key },
      });

      if (!existing) {
        await this.createTemplate(templateData as any);
      }
    }
  }
}