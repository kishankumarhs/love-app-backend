import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ModerationQueue,
  ModerationStatus,
  ContentType,
  ReportReason,
} from '../entities/moderation-queue.entity';
import { Review, ReviewStatus } from '../entities/review.entity';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(ModerationQueue)
    private moderationQueueRepository: Repository<ModerationQueue>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async reportContent(
    contentType: ContentType,
    contentId: string,
    reason: ReportReason,
    reportedById?: string,
    description?: string,
  ): Promise<ModerationQueue> {
    const moderationItem = this.moderationQueueRepository.create({
      contentType,
      contentId,
      reason,
      reportedById,
      description,
      status: ModerationStatus.PENDING,
    });

    const saved = await this.moderationQueueRepository.save(moderationItem);

    // Update reported count for reviews
    if (contentType === ContentType.REVIEW) {
      await this.reviewRepository.increment(
        { id: contentId },
        'reportedCount',
        1,
      );
    }

    return saved;
  }

  async getModerationQueue(
    status?: ModerationStatus,
    contentType?: ContentType,
    assignedToId?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ items: ModerationQueue[]; total: number }> {
    const query = this.moderationQueueRepository
      .createQueryBuilder('moderation')
      .leftJoinAndSelect('moderation.reportedBy', 'reportedBy')
      .leftJoinAndSelect('moderation.assignedTo', 'assignedTo')
      .leftJoinAndSelect('moderation.resolvedBy', 'resolvedBy')
      .orderBy('moderation.priority', 'DESC')
      .addOrderBy('moderation.createdAt', 'ASC');

    if (status) {
      query.andWhere('moderation.status = :status', { status });
    }

    if (contentType) {
      query.andWhere('moderation.contentType = :contentType', { contentType });
    }

    if (assignedToId) {
      query.andWhere('moderation.assignedToId = :assignedToId', {
        assignedToId,
      });
    }

    const [items, total] = await query
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  async assignModerationItem(
    itemId: string,
    assignedToId: string,
  ): Promise<ModerationQueue> {
    const item = await this.moderationQueueRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Moderation item not found');
    }

    item.assignedToId = assignedToId;
    item.status = ModerationStatus.REVIEWED;

    return await this.moderationQueueRepository.save(item);
  }

  async resolveModeration(
    itemId: string,
    resolvedById: string,
    resolutionNotes?: string,
    action?: 'approve' | 'reject' | 'dismiss',
  ): Promise<ModerationQueue> {
    const item = await this.moderationQueueRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Moderation item not found');
    }

    item.resolvedById = resolvedById;
    item.resolutionNotes = resolutionNotes;
    item.resolvedAt = new Date();
    item.status = ModerationStatus.RESOLVED;

    // Apply moderation action to content
    if (item.contentType === ContentType.REVIEW && action) {
      await this.applyReviewModerationAction(
        item.contentId,
        action,
        resolvedById,
        resolutionNotes,
      );
    }

    return await this.moderationQueueRepository.save(item);
  }

  async dismissModeration(
    itemId: string,
    resolvedById: string,
    reason?: string,
  ): Promise<ModerationQueue> {
    const item = await this.moderationQueueRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Moderation item not found');
    }

    item.resolvedById = resolvedById;
    item.resolutionNotes = reason;
    item.resolvedAt = new Date();
    item.status = ModerationStatus.DISMISSED;

    return await this.moderationQueueRepository.save(item);
  }

  private async applyReviewModerationAction(
    reviewId: string,
    action: 'approve' | 'reject' | 'dismiss',
    moderatedById: string,
    rejectionReason?: string,
  ): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      return;
    }

    review.moderatedById = moderatedById;
    review.moderatedAt = new Date();

    switch (action) {
      case 'approve':
        review.status = ReviewStatus.APPROVED;
        break;
      case 'reject':
        review.status = ReviewStatus.REJECTED;
        review.rejectionReason = rejectionReason;
        break;
      case 'dismiss':
        // Keep current status but mark as moderated
        break;
    }

    await this.reviewRepository.save(review);
  }
}
