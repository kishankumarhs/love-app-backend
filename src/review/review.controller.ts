import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { ReviewService } from './review.service';
import { ModerationService } from './services/moderation.service';
import { ReportService } from './services/report.service';
import { AuditService } from './services/audit.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewStatus } from './entities/review.entity';
import { ReportType, ReportFormat } from './entities/report.entity';
import {
  ModerationStatus,
  ContentType,
  ReportReason,
} from './entities/moderation-queue.entity';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly moderationService: ModerationService,
    private readonly reportService: ReportService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    const userInfo = {
      userId: req.user.id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };
    return this.reviewService.create(
      { ...createReviewDto, userId: req.user.id },
      userInfo,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  findAll(
    @Query('status') status?: ReviewStatus,
    @Query('providerId') providerId?: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return this.reviewService.findAll(status, providerId, limit, offset);
  }

  @Get('provider/:providerId')
  @ApiOperation({ summary: 'Get provider reviews' })
  @ApiResponse({
    status: 200,
    description: 'Provider reviews retrieved successfully',
  })
  getProviderReviews(
    @Param('providerId') providerId: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return this.reviewService.getProviderReviews(
      providerId,
      ReviewStatus.APPROVED,
      limit,
      offset,
    );
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report review' })
  @ApiResponse({ status: 201, description: 'Review reported successfully' })
  reportReview(
    @Param('id') id: string,
    @Body() body: { reason: ReportReason; description?: string },
    @Request() req,
  ) {
    return this.reviewService.reportReview(
      id,
      body.reason,
      req.user.id,
      body.description,
    );
  }

  @Post(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Moderate review' })
  @ApiResponse({ status: 200, description: 'Review moderated successfully' })
  moderateReview(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; rejectionReason?: string },
    @Request() req,
  ) {
    const userInfo = {
      userId: req.user.id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };
    return this.reviewService.moderateReview(
      id,
      body.action,
      req.user.id,
      body.rejectionReason,
      userInfo,
    );
  }

  @Get('moderation/queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get moderation queue' })
  @ApiResponse({
    status: 200,
    description: 'Moderation queue retrieved successfully',
  })
  getModerationQueue(
    @Query('status') status?: ModerationStatus,
    @Query('contentType') contentType?: ContentType,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return this.moderationService.getModerationQueue(
      status,
      contentType,
      undefined,
      limit,
      offset,
    );
  }

  @Post('moderation/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve moderation item' })
  @ApiResponse({ status: 200, description: 'Moderation resolved successfully' })
  resolveModeration(
    @Param('id') id: string,
    @Body() body: { action?: 'approve' | 'reject' | 'dismiss'; notes?: string },
    @Request() req,
  ) {
    return this.moderationService.resolveModeration(
      id,
      req.user.id,
      body.notes,
      body.action,
    );
  }

  @Post('reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create admin report' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  createReport(
    @Body()
    body: {
      name: string;
      type: ReportType;
      filters?: Record<string, any>;
      columns?: string[];
      format?: ReportFormat;
    },
    @Request() req,
  ) {
    return this.reportService.createReport(
      body.name,
      body.type,
      req.user.id,
      body.filters,
      body.columns,
      body.format,
    );
  }

  @Get('reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin reports' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  getReports(@Request() req) {
    return this.reportService.getReports(req.user.id);
  }

  @Get('reports/:id/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download report' })
  @ApiResponse({ status: 200, description: 'Report downloaded successfully' })
  async downloadReport(@Param('id') id: string, @Res() res: Response) {
    const { filePath, fileName } = await this.reportService.downloadReport(id);
    res.download(filePath, fileName);
  }

  @Get('audit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  getAuditLogs(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0,
  ) {
    return this.auditService.getAuditLogs(
      entityType,
      entityId,
      userId,
      action as any,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  remove(@Param('id') id: string, @Request() req) {
    const userInfo = {
      userId: req.user.id,
      email: req.user.email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };
    return this.reviewService.remove(id, userInfo);
  }
}
