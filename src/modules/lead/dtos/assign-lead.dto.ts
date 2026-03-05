import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AssignLeadDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'User ID to assign. Omit or null to unassign.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID('4')
  assignedToId?: string | null;
}
