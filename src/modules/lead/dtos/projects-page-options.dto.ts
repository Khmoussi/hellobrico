import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto.ts';
import { BudgetBracket } from '../../../constants/budget-bracket.ts';
import { ProjectStatus } from '../../../constants/project-status.ts';
import { PropertyType } from '../../../constants/property-type.ts';

export class ProjectsPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiPropertyOptional({ enum: BudgetBracket })
  @IsOptional()
  @IsEnum(BudgetBracket)
  budgetBracket?: BudgetBracket;
}
