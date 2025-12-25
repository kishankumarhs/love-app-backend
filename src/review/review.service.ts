import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuditService } from './services/audit.service';
import { ModerationService } from './services/moderation.service';
import { AuditAction } from '../audit/entities/audit-log.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private auditService: AuditService,
    private moderationService: ModerationService,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    userInfo?: any,
  ): Promise<Review> {
    // Check if user already reviewed this provider
    const existingReview = await this.reviewRepository.findOne({
      where: {
        userId: createReviewDto.userId,
        providerId: createReviewDto.providerId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this provider');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      status: ReviewStatus.PENDING,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Log audit
    await this.auditService.log(
      'Review',
      savedReview.id,
      AuditAction.CREATE,
      userInfo?.userId,
      userInfo?.email,
      userInfo?.ipAddress,
      userInfo?.userAgent,
      null,
      savedReview,
    );

    return savedReview;
  }

  async findAll(
    status?: ReviewStatus,
    providerId?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ reviews: Review[]; total: number }> {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.provider', 'provider')
      .orderBy('review.createdAt', 'DESC');

    if (status) {
      query.andWhere('review.status = :status', { status });
    }

    if (providerId) {
      query.andWhere('review.providerId = :providerId', { providerId });
    }

    const [reviews, total] = await query
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { reviews, total };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'provider', 'moderatedBy'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async moderateReview(
    id: string,
    action: 'approve' | 'reject',
    moderatedById: string,
    rejectionReason?: string,
    userInfo?: any,
  ): Promise<Review> {
    const review = await this.findOne(id);
    const oldValues = { ...review };

    review.moderatedById = moderatedById;
    review.moderatedAt = new Date();
    review.status =
      action === 'approve' ? ReviewStatus.APPROVED : ReviewStatus.REJECTED;

    if (action === 'reject' && rejectionReason) {
      review.rejectionReason = rejectionReason;
    }

    const updatedReview = await this.reviewRepository.save(review);

    // Log audit
    await this.auditService.log(
      'Review',
      review.id,
      AuditAction.UPDATE,
      userInfo?.userId,
      userInfo?.email,
      userInfo?.ipAddress,
      userInfo?.userAgent,
      oldValues,
      updatedReview,
      { action: 'moderate', moderationAction: action },
    );

    return updatedReview;
  }

  async reportReview(
    reviewId: string,
    reason: string,
    reportedById?: string,
    description?: string,
  ): Promise<void> {
    const review = await this.findOne(reviewId);

    await this.moderationService.reportContent(
      review as any,
      reviewId,
      reason as any,
      reportedById,
      description,
    );

    // Increment reported count
    await this.reviewRepository.increment({ id: reviewId }, 'reportedCount', 1);
  }

  async getProviderReviews(
    providerId: string,
    status: ReviewStatus = ReviewStatus.APPROVED,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ reviews: Review[]; total: number; averageRating: number }> {
    const { reviews, total } = await this.findAll(
      status,
      providerId,
      limit,
      offset,
    );

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    return { reviews, total, averageRating };
  }

  async remove(id: string, userInfo?: any): Promise<void> {
    const review = await this.findOne(id);

    await this.reviewRepository.delete(id);

    // Log audit
    await this.auditService.log(
      'Review',
      id,
      AuditAction.DELETE,
      userInfo?.userId,
      userInfo?.email,
      userInfo?.ipAddress,
      userInfo?.userAgent,
      review,
      null,
    );
  }
}
