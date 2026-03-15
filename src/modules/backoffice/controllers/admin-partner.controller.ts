import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiNoContentResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto.ts';
import { RoleType } from '../../../constants/role-type.ts';
import { ApiPageResponse } from '../../../decorators/api-page-response.decorator.ts';
import { Auth, UUIDParam } from '../../../decorators/http.decorators.ts';
import { PartnerDto } from '../../lead/dtos/partner.dto.ts';
import { PartnersPageOptionsDto } from '../../lead/dtos/partners-page-options.dto.ts';
import { UpdatePartnerDto } from '../../lead/dtos/update-partner.dto.ts';
import { PartnerService } from '../../lead/partner.service.ts';

@Controller('admin/partners')
@ApiTags('admin-partners')
export class AdminPartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageResponse({
    description: 'Get paginated list of partnership proposals',
    type: PageDto,
  })
  async getPartners(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: PartnersPageOptionsDto,
  ): Promise<PageDto<PartnerDto>> {
    return this.partnerService.getPartners(pageOptionsDto);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: PartnerDto,
    description: 'Partnership proposal by id',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async getPartner(@UUIDParam('id') id: Uuid): Promise<PartnerDto> {
    return this.partnerService.getPartnerById(id);
  }

  @Patch(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: PartnerDto,
    description: 'Partner updated (e.g. logo set by admin)',
  })
  @ApiBody({
    type: UpdatePartnerDto,
    examples: {
      logo: {
        summary: 'Set partner logo URL',
        value: { logo: 'https://example.com/partner-logo.png' },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async updatePartner(
    @UUIDParam('id') id: Uuid,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ): Promise<PartnerDto> {
    return this.partnerService.updatePartner(id, updatePartnerDto);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Partner removed',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async deletePartner(@UUIDParam('id') id: Uuid): Promise<void> {
    return this.partnerService.deletePartner(id);
  }
}
