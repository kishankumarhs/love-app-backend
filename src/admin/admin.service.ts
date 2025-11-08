import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In } from 'typeorm';
import { AdminAnalytics, MetricType, PeriodType } from './entities/admin-analytics.entity';
import { AdminAction, AdminActionType } from './entities/admin-action.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { User, UserStatus } from '../user/entities/user.entity';
import { Provider } from '../provider/entities/provider.entity';
import { Campaign } from '../campaign/entities/campaign.entity';
import { Donation, DonationStatus } from '../donations/entities/donation.entity';
import { Volunteer } from '../volunteer/entities/volunteer.entity';
import { AdminFiltersDto, AnalyticsFiltersDto } from './dto/admin-filters.dto';
import { CreateAdminActionDto, UserManagementDto, ProviderManagementDto } from './dto/admin-action.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminAnalytics)
    private analyticsRepository: Repository<AdminAnalytics>,
    @InjectRepository(AdminAction)
    private actionRepository: Repository<AdminAction>,
    @InjectRepository(SystemSetting)
    private settingRepository: Repository<SystemSetting>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
  ) {}

  // Analytics
  async getDashboardMetrics(): Promise<any> {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalProviders,
      totalCampaigns,
      totalDonations,
      totalVolunteers,
      recentUsers,
      recentDonations,
    ] = await Promise.all([
      this.userRepository.count(),
      this.providerRepository.count(),
      this.campaignRepository.count(),
      this.donationRepository.count({ where: { status: DonationStatus.COMPLETED } }),
      this.volunteerRepository.count(),
      this.userRepository.count({ where: { createdAt: Between(thirtyDaysAgo, today) } }),
      this.donationRepository.sum('amount', { status: DonationStatus.COMPLETED, createdAt: Between(thirtyDaysAgo, today) }),
    ]);

    return {
      overview: {
        totalUsers,
        totalProviders,
        totalCampaigns,
        totalDonations,
        totalVolunteers,
      },
      recent: {
        newUsers: recentUsers,
        donationAmount: recentDonations || 0,
      },
    };
  }

  async getAnalytics(filters: AnalyticsFiltersDto): Promise<AdminAnalytics[]> {
    const query = this.analyticsRepository.createQueryBuilder('analytics');

    if (filters.metricType) {
      query.andWhere('analytics.metricType = :metricType', { metricType: filters.metricType });
    }

    if (filters.periodType) {
      query.andWhere('analytics.periodType = :periodType', { periodType: filters.periodType });
    }

    if (filters.startDate) {
      query.andWhere('analytics.periodStart >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('analytics.periodEnd <= :endDate', { endDate: filters.endDate });
    }

    return await query.orderBy('analytics.createdAt', 'DESC').getMany();
  }

  // User Management
  async getUsers(filters: AdminFiltersDto): Promise<{ users: User[]; total: number }> {
    const query = this.userRepository.createQueryBuilder('user');

    if (filters.search) {
      query.andWhere('(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)', 
        { search: `%${filters.search}%` });
    }

    if (filters.status) {
      query.andWhere('user.status = :status', { status: filters.status });
    }

    if (filters.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.startDate) {
      query.andWhere('user.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('user.createdAt <= :endDate', { endDate: filters.endDate });
    }

    const total = await query.getCount();
    const users = await query
      .orderBy(`user.${filters.sortBy || 'createdAt'}`, filters.sortOrder)
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getMany();

    return { users, total };
  }

  async manageUser(dto: UserManagementDto, adminId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let actionType: AdminActionType;
    
    switch (dto.action) {
      case 'suspend':
        user.status = UserStatus.SUSPENDED;
        actionType = AdminActionType.USER_SUSPEND;
        break;
      case 'activate':
        user.status = UserStatus.ACTIVE;
        actionType = AdminActionType.USER_ACTIVATE;
        break;
      case 'delete':
        await this.userRepository.delete(dto.userId);
        await this.logAdminAction({
          actionType: AdminActionType.USER_SUSPEND,
          targetType: 'User',
          targetId: dto.userId,
          reason: dto.reason,
        }, adminId);
        return user;
    }

    const updatedUser = await this.userRepository.save(user);
    await this.logAdminAction({
      actionType,
      targetType: 'User',
      targetId: dto.userId,
      reason: dto.reason,
    }, adminId);

    return updatedUser;
  }

  // Provider Management
  async getProviders(filters: AdminFiltersDto): Promise<{ providers: Provider[]; total: number }> {
    const query = this.providerRepository.createQueryBuilder('provider');

    if (filters.search) {
      query.andWhere('(provider.name ILIKE :search OR provider.email ILIKE :search)', 
        { search: `%${filters.search}%` });
    }

    if (filters.status) {
      const isActive = filters.status === 'active';
      query.andWhere('provider.isActive = :isActive', { isActive });
    }

    const total = await query.getCount();
    const providers = await query
      .orderBy(`provider.${filters.sortBy || 'createdAt'}`, filters.sortOrder)
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getMany();

    return { providers, total };
  }

  async manageProvider(dto: ProviderManagementDto, adminId: string): Promise<Provider> {
    const provider = await this.providerRepository.findOne({ where: { id: dto.providerId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    let actionType: AdminActionType;
    
    switch (dto.action) {
      case 'approve':
        provider.isActive = true;
        actionType = AdminActionType.PROVIDER_APPROVE;
        break;
      case 'reject':
        provider.isActive = false;
        actionType = AdminActionType.PROVIDER_REJECT;
        break;
      case 'suspend':
        provider.isActive = false;
        actionType = AdminActionType.PROVIDER_REJECT;
        break;
    }

    const updatedProvider = await this.providerRepository.save(provider);
    await this.logAdminAction({
      actionType,
      targetType: 'Provider',
      targetId: dto.providerId,
      reason: dto.reason,
    }, adminId);

    return updatedProvider;
  }

  // Campaign Management
  async getCampaigns(filters: AdminFiltersDto): Promise<{ campaigns: Campaign[]; total: number }> {
    const query = this.campaignRepository.createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.provider', 'provider');

    if (filters.search) {
      query.andWhere('campaign.title ILIKE :search', { search: `%${filters.search}%` });
    }

    if (filters.status) {
      query.andWhere('campaign.status = :status', { status: filters.status });
    }

    const total = await query.getCount();
    const campaigns = await query
      .orderBy(`campaign.${filters.sortBy || 'createdAt'}`, filters.sortOrder)
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getMany();

    return { campaigns, total };
  }

  // Donation Management
  async getDonations(filters: AdminFiltersDto): Promise<{ donations: Donation[]; total: number }> {
    const query = this.donationRepository.createQueryBuilder('donation')
      .leftJoinAndSelect('donation.user', 'user')
      .leftJoinAndSelect('donation.campaign', 'campaign');

    if (filters.status) {
      query.andWhere('donation.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      query.andWhere('donation.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('donation.createdAt <= :endDate', { endDate: filters.endDate });
    }

    const total = await query.getCount();
    const donations = await query
      .orderBy(`donation.${filters.sortBy || 'createdAt'}`, filters.sortOrder)
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getMany();

    return { donations, total };
  }

  // Volunteer Management
  async getVolunteers(filters: AdminFiltersDto): Promise<{ volunteers: Volunteer[]; total: number }> {
    const query = this.volunteerRepository.createQueryBuilder('volunteer')
      .leftJoinAndSelect('volunteer.user', 'user');

    if (filters.search) {
      query.andWhere('(user.firstName ILIKE :search OR user.lastName ILIKE :search)', 
        { search: `%${filters.search}%` });
    }

    if (filters.status) {
      query.andWhere('volunteer.status = :status', { status: filters.status });
    }

    const total = await query.getCount();
    const volunteers = await query
      .orderBy(`volunteer.${filters.sortBy || 'createdAt'}`, filters.sortOrder)
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getMany();

    return { volunteers, total };
  }

  // System Settings
  async getSettings(): Promise<SystemSetting[]> {
    return await this.settingRepository.find({ order: { settingKey: 'ASC' } });
  }

  async updateSetting(key: string, value: string, adminId: string): Promise<SystemSetting> {
    const setting = await this.settingRepository.findOne({ where: { settingKey: key } });
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    setting.settingValue = value;
    setting.updatedById = adminId;
    
    return await this.settingRepository.save(setting);
  }

  // Admin Actions
  async getAdminActions(filters: AdminFiltersDto): Promise<{ actions: AdminAction[]; total: number }> {
    const query = this.actionRepository.createQueryBuilder('action')
      .leftJoinAndSelect('action.admin', 'admin');

    if (filters.startDate) {
      query.andWhere('action.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('action.createdAt <= :endDate', { endDate: filters.endDate });
    }

    const total = await query.getCount();
    const actions = await query
      .orderBy('action.createdAt', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getMany();

    return { actions, total };
  }

  private async logAdminAction(dto: CreateAdminActionDto, adminId: string): Promise<AdminAction> {
    const action = this.actionRepository.create({
      ...dto,
      adminId,
    });
    return await this.actionRepository.save(action);
  }
}