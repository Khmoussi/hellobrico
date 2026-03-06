import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { ProjectStep } from '../../../constants/project-step-status.ts';

export class UpdateProjectStepDto {
  @ApiProperty({ enum: ProjectStep })
  @IsEnum(ProjectStep)
  currentStep!: ProjectStep;
}
