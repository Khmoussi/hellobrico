import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto.ts';
import { BudgetBracket } from '../../../constants/budget-bracket.ts';
import { LeadStatus } from '../../../constants/lead-status.ts';
import { PropertyType } from '../../../constants/property-type.ts';

export class LeadsPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiPropertyOptional({ enum: BudgetBracket })
  @IsOptional()
  @IsEnum(BudgetBracket)
  budgetBracket?: BudgetBracket;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAbroad?: boolean;
}

