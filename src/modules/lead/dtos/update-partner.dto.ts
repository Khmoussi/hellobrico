import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { EmptyToUndefined } from '../../../decorators/transform.decorators.ts';

export class UpdatePartnerDto {
  @EmptyToUndefined()
  @ApiPropertyOptional({ example: 'https://example.com/partner-logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string | null;
}
