import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Handlebars from 'handlebars';
import { NotificationTemplate, TemplateType, TemplateCategory } from '../entities/notification-template.entity';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
  ) {}

  async getTemplate(name: string): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({
      where: { name, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(`Template ${name} not found`);
    }

    return template;
  }

  async renderTemplate(templateName: string, data: Record<string, any>): Promise<{ subject?: string; content: string }> {
    const template = await this.getTemplate(templateName);
    
    const contentTemplate = Handlebars.compile(template.templateContent);
    const content = contentTemplate(data);

    let subject: string | undefined;
    if (template.subject) {
      const subjectTemplate = Handlebars.compile(template.subject);
      subject = subjectTemplate(data);
    }

    return { subject, content };
  }

  async getTemplatesByCategory(category: TemplateCategory): Promise<NotificationTemplate[]> {
    return await this.templateRepository.find({
      where: { category, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async createTemplate(
    name: string,
    type: TemplateType,
    category: TemplateCategory,
    templateContent: string,
    subject?: string,
    variables: string[] = [],
  ): Promise<NotificationTemplate> {
    const template = this.templateRepository.create({
      name,
      type,
      category,
      templateContent,
      subject,
      variables,
    });

    return await this.templateRepository.save(template);
  }

  async updateTemplate(
    id: string,
    updates: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate> {
    await this.templateRepository.update(id, updates);
    return await this.templateRepository.findOne({ where: { id } });
  }
}