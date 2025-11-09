import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Org, OrgStatus } from '@love-app/common/entities/org.entity';
import { User, UserRole } from '@love-app/common/entities/user.entity';
import { CreateProviderDto, SearchProvidersDto, AddEmployeeDto } from './dto/provider.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createProviderDto: CreateProviderDto, userId: string) {
    const org = this.orgRepository.create({
      ...createProviderDto,
      status: OrgStatus.PENDING,
    });

    await this.orgRepository.save(org);

    // Update user to be provider admin
    await this.userRepository.update(userId, {
      role: UserRole.PROVIDER_ADMIN,
      org_id: org.id,
    });

    return org;
  }

  async search(searchDto: SearchProvidersDto) {
    const query = this.orgRepository
      .createQueryBuilder('org')
      .leftJoinAndSelect('org.services', 'service')
      .where('org.status = :status', { status: OrgStatus.APPROVED });

    if (searchDto.search) {
      query.andWhere('org.name ILIKE :search', { search: `%${searchDto.search}%` });
    }

    if (searchDto.latitude && searchDto.longitude) {
      const radius = searchDto.radius || 10; // Default 10km radius
      query.andWhere(
        `ST_DWithin(
          ST_MakePoint(org.longitude, org.latitude)::geography,
          ST_MakePoint(:longitude, :latitude)::geography,
          :radius
        )`,
        {
          longitude: searchDto.longitude,
          latitude: searchDto.latitude,
          radius: radius * 1000, // Convert to meters
        },
      );
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const org = await this.orgRepository.findOne({
      where: { id },
      relations: ['services', 'campaigns'],
    });

    if (!org) {
      throw new NotFoundException('Provider not found');
    }

    return org;
  }

  async addEmployee(orgId: string, addEmployeeDto: AddEmployeeDto, currentUserId: string) {
    // Verify current user is admin of this org
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (currentUser.org_id !== orgId || currentUser.role !== UserRole.PROVIDER_ADMIN) {
      throw new ForbiddenException('Only organization admins can add employees');
    }

    // Check if user already exists
    let user = await this.userRepository.findOne({
      where: { email: addEmployeeDto.email },
    });

    if (user) {
      // Update existing user
      user.org_id = orgId;
      user.role = UserRole.PROVIDER_STAFF;
    } else {
      // Create new user
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      user = this.userRepository.create({
        ...addEmployeeDto,
        password: hashedPassword,
        role: UserRole.PROVIDER_STAFF,
        org_id: orgId,
      });
    }

    await this.userRepository.save(user);
    return { ...user, password: undefined };
  }

  async getEmployees(orgId: string, currentUserId: string) {
    // Verify current user belongs to this org
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (currentUser.org_id !== orgId) {
      throw new ForbiddenException('Access denied');
    }

    return this.userRepository.find({
      where: { org_id: orgId },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'status'],
    });
  }

  async getDashboardMetrics(orgId: string, currentUserId: string) {
    // Verify access
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (currentUser.org_id !== orgId) {
      throw new ForbiddenException('Access denied');
    }

    // Get basic metrics (simplified for MVP)
    const org = await this.orgRepository.findOne({
      where: { id: orgId },
      relations: ['services', 'campaigns'],
    });

    return {
      activeServices: 0,
      activeCampaigns: 0,
      totalEmployees: await this.userRepository.count({ where: { org_id: orgId } }),
      // Additional metrics would be calculated here
      peopleHelped: 0,
      vouchersIssued: 0,
      pendingReferrals: 0,
    };
  }
}