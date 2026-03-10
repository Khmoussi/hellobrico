import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { ProjectStatus } from '../../../constants/project-status.ts';

export class UpdateProjectStatusDto {
  @ApiProperty({ enum: ProjectStatus })
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;
}
