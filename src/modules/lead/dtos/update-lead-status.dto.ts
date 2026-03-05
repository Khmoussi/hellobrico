import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { LeadStatus } from '../../../constants/lead-status.ts';

export class UpdateLeadStatusDto {
  @ApiProperty({ enum: LeadStatus, example: LeadStatus.CONTACTE })
  @IsEnum(LeadStatus)
  status!: LeadStatus;

  @ApiPropertyOptional({
    description: 'Required when status is PERDU',
    example: 'Budget trop élevé',
  })
  @IsOptional()
  @IsString()
  lostReason?: string | null;
}
