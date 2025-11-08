import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import * as csvWriter from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';
import { Report, ReportType, ReportStatus, ReportFormat } from '../entities/report.entity';
import { User } from '../../user/entities/user.entity';
import { Provider } from '../../provider/entities/provider.entity';
import { Campaign } from '../../campaign/entities/campaign.entity';
import { Donation } from '../../donations/entities/donation.entity';
import { Review } from '../entities/review.entity';
import { Volunteer } from '../../volunteer/entities/volunteer.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
  ) {}

  async createReport(
    name: string,
    type: ReportType,
    generatedById: string,
    filters: Record<string, any> = {},
    columns: string[] = [],
    format: ReportFormat = ReportFormat.CSV,
  ): Promise<Report> {
    const report = this.reportRepository.create({
      name,
      type,
      generatedById,
      filters,
      columns,
      format,
      status: ReportStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const savedReport = await this.reportRepository.save(report);

    // Process report asynchronously
    this.processReport(savedReport.id);

    return savedReport;
  }

  async getReports(generatedById?: string): Promise<Report[]> {
    const where = generatedById ? { generatedById } : {};
    return await this.reportRepository.find({
      where,
      relations: ['generatedBy'],
      order: { generatedAt: 'DESC' },
    });
  }

  async getReport(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['generatedBy'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async downloadReport(id: string): Promise<{ filePath: string; fileName: string }> {
    const report = await this.getReport(id);

    if (report.status !== ReportStatus.COMPLETED || !report.filePath) {
      throw new NotFoundException('Report file not available');
    }

    // Increment download count
    await this.reportRepository.increment({ id }, 'downloadCount', 1);

    const fileName = `${report.name}.${report.format}`;
    return { filePath: report.filePath, fileName };
  }

  private async processReport(reportId: string): Promise<void> {
    try {
      const report = await this.getReport(reportId);
      
      // Update status to processing
      await this.reportRepository.update(reportId, { status: ReportStatus.PROCESSING });

      const data = await this.fetchReportData(report.type, report.filters, report.columns);
      const filePath = await this.generateReportFile(data, report.format, report.name);
      const fileSize = fs.statSync(filePath).size;

      // Update report with file info
      await this.reportRepository.update(reportId, {
        status: ReportStatus.COMPLETED,
        filePath,
        fileSize,
      });
    } catch (error) {
      await this.reportRepository.update(reportId, {
        status: ReportStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }

  private async fetchReportData(
    type: ReportType,
    filters: Record<string, any>,
    columns: string[],
  ): Promise<any[]> {
    let query: any;
    let defaultColumns: string[] = [];

    switch (type) {
      case ReportType.USERS:
        query = this.userRepository.createQueryBuilder('user');
        defaultColumns = ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt'];
        break;
      case ReportType.PROVIDERS:
        query = this.providerRepository.createQueryBuilder('provider');
        defaultColumns = ['id', 'name', 'email', 'phone', 'address', 'createdAt'];
        break;
      case ReportType.CAMPAIGNS:
        query = this.campaignRepository.createQueryBuilder('campaign')
          .leftJoinAndSelect('campaign.provider', 'provider');
        defaultColumns = ['id', 'title', 'description', 'goalAmount', 'currentAmount', 'status', 'createdAt'];
        break;
      case ReportType.DONATIONS:
        query = this.donationRepository.createQueryBuilder('donation')
          .leftJoinAndSelect('donation.user', 'user')
          .leftJoinAndSelect('donation.campaign', 'campaign');
        defaultColumns = ['id', 'amount', 'status', 'createdAt'];
        break;
      case ReportType.REVIEWS:
        query = this.reviewRepository.createQueryBuilder('review')
          .leftJoinAndSelect('review.user', 'user')
          .leftJoinAndSelect('review.provider', 'provider');
        defaultColumns = ['id', 'rating', 'comment', 'status', 'createdAt'];
        break;
      case ReportType.VOLUNTEERS:
        query = this.volunteerRepository.createQueryBuilder('volunteer')
          .leftJoinAndSelect('volunteer.user', 'user');
        defaultColumns = ['id', 'interests', 'skills', 'availability', 'status', 'createdAt'];
        break;
      default:
        throw new Error(`Unsupported report type: ${type}`);
    }

    // Apply filters
    this.applyFilters(query, filters);

    const results = await query.getMany();
    const selectedColumns = columns.length > 0 ? columns : defaultColumns;

    return results.map(item => this.extractColumns(item, selectedColumns));
  }

  private applyFilters(query: any, filters: Record<string, any>): void {
    if (filters.startDate) {
      query.andWhere('createdAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('createdAt <= :endDate', { endDate: filters.endDate });
    }
    if (filters.status) {
      query.andWhere('status = :status', { status: filters.status });
    }
    if (filters.role) {
      query.andWhere('role = :role', { role: filters.role });
    }
  }

  private extractColumns(item: any, columns: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const column of columns) {
      const value = this.getNestedValue(item, column);
      result[column] = value;
    }
    
    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async generateReportFile(
    data: any[],
    format: ReportFormat,
    name: string,
  ): Promise<string> {
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `${name}_${timestamp}.${format}`;
    const filePath = path.join(reportsDir, fileName);

    if (format === ReportFormat.CSV) {
      await this.generateCSV(data, filePath);
    } else if (format === ReportFormat.XLSX) {
      await this.generateXLSX(data, filePath);
    } else if (format === ReportFormat.JSON) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    return filePath;
  }

  private async generateCSV(data: any[], filePath: string): Promise<void> {
    if (data.length === 0) {
      fs.writeFileSync(filePath, '');
      return;
    }

    const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));
    const writer = csvWriter.createObjectCsvWriter({
      path: filePath,
      header: headers,
    });

    await writer.writeRecords(data);
  }

  private async generateXLSX(data: any[], filePath: string): Promise<void> {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, filePath);
  }
}