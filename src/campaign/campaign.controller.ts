import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.campaignService.publishCampaign(id);
  }

  // Assign employees to campaign
  @Post(':id/employees')
  assignEmployees(
    @Param('id') id: string,
    @Body('employeeIds') employeeIds: string[],
  ) {
    return this.campaignService.assignEmployees(id, employeeIds);
  }

  // Unassign employee from campaign
  @Delete(':id/employees/:employeeId')
  unassignEmployee(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.campaignService.unassignEmployee(id, employeeId);
  }

  // List employees for a campaign
  @Get(':id/employees')
  listEmployees(@Param('id') id: string) {
    return this.campaignService.listEmployees(id);
  }

  @Post()
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.create(createCampaignDto);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('providerId') providerId?: string,
    @Query('status') status?: string,
  ) {
    return this.campaignService.findAll({ category, providerId, status });
  }

  @Get('search')
  search(
    @Query('category') category?: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius?: number,
    @Query('status') status?: string,
  ) {
    return this.campaignService.search({
      category,
      latitude,
      longitude,
      radius,
      status,
    });
  }

  @Get('provider/:providerId')
  findByProvider(@Param('providerId') providerId: string) {
    return this.campaignService.findByProvider(providerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campaignService.remove(id);
  }
}
