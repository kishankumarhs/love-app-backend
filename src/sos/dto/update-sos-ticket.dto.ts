import { IsString, IsOptional } from 'class-validator';

export class UpdateSOSTicketDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
