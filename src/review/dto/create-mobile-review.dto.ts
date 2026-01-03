import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, IsOptional, Min, Max, IsBoolean } from 'class-validator';

export class CreateMobileReviewDto {
    @ApiProperty({ minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiProperty()
    @IsUUID()
    providerId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isAnonymous?: boolean;
}
