import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto.ts';
import { PartnershipType } from '../../../constants/partnership-type.ts';

export class PartnersPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: PartnershipType })
  @IsOptional()
  @IsEnum(PartnershipType)
  partnershipType?: PartnershipType;
}
