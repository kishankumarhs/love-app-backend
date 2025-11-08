import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  AdminAnalytics,
  MetricType,
  PeriodType,
} from '../entities/admin-analytics.entity';
import { User } from '../../user/entities/user.entity';
import {
  Donation,
  DonationStatus,
} from '../../donations/entities/donation.entity';
import { Campaign } from '../../campaign/entities/campaign.entity';
import { Provider } from '../../provider/entities/provider.entity';
import { Volunteer } from '../../volunteer/entities/volunteer.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AdminAnalytics)
    private analyticsRepository: Repository<AdminAnalytics>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
  ) {}

  async calculateDailyMetrics(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);

    await Promise.all([
      this.calculateUserMetrics(yesterday, today),
      this.calculateDonationMetrics(yesterday, today),
      this.calculateCampaignMetrics(yesterday, today),
    ]);
  }

  private async calculateUserMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const newUsers = await this.userRepository.count({
      where: { createdAt: Between(startDate, endDate) },
    });

    const totalUsers = await this.userRepository.count();

    const metrics = [
      {
        metricType: MetricType.USERS,
        metricName: 'new_registrations',
        metricValue: newUsers,
        periodType: PeriodType.DAILY,
        periodStart: startDate,
        periodEnd: startDate,
      },
      {
        metricType: MetricType.USERS,
        metricName: 'total_count',
        metricValue: totalUsers,
        periodType: PeriodType.DAILY,
        periodStart: startDate,
        periodEnd: startDate,
      },
    ];

    await this.analyticsRepository.save(metrics);
  }

  private async calculateDonationMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const dailyDonations = await this.donationRepository
      .createQueryBuilder('donation')
      .select('COUNT(*)', 'count')
      .addSelect('SUM(amount)', 'total')
      .where('donation.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('donation.status = :status', {
        status: DonationStatus.COMPLETED,
      })
      .getRawOne();

    const metrics = [
      {
        metricType: MetricType.DONATIONS,
        metricName: 'daily_count',
        metricValue: parseInt(dailyDonations.count) || 0,
        periodType: PeriodType.DAILY,
        periodStart: startDate,
        periodEnd: startDate,
      },
      {
        metricType: MetricType.DONATIONS,
        metricName: 'daily_amount',
        metricValue: parseFloat(dailyDonations.total) || 0,
        periodType: PeriodType.DAILY,
        periodStart: startDate,
        periodEnd: startDate,
      },
    ];

    await this.analyticsRepository.save(metrics);
  }

  private async calculateCampaignMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const newCampaigns = await this.campaignRepository.count({
      where: { createdAt: Between(startDate, endDate) },
    });

    const metrics = [
      {
        metricType: MetricType.CAMPAIGNS,
        metricName: 'new_campaigns',
        metricValue: newCampaigns,
        periodType: PeriodType.DAILY,
        periodStart: startDate,
        periodEnd: startDate,
      },
    ];

    await this.analyticsRepository.save(metrics);
  }

  async getMetricsSummary(days: number = 30): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.analyticsRepository.find({
      where: {
        periodStart: Between(startDate, endDate),
        periodType: PeriodType.DAILY,
      },
      order: { periodStart: 'ASC' },
    });

    return this.groupMetricsByType(metrics);
  }

  private groupMetricsByType(metrics: AdminAnalytics[]): any {
    const grouped = metrics.reduce((acc, metric) => {
      if (!acc[metric.metricType]) {
        acc[metric.metricType] = {};
      }
      if (!acc[metric.metricType][metric.metricName]) {
        acc[metric.metricType][metric.metricName] = [];
      }
      acc[metric.metricType][metric.metricName].push({
        date: metric.periodStart,
        value: metric.metricValue,
      });
      return acc;
    }, {});

    return grouped;
  }
}
