import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { PublicRoute } from '../../decorators/public-route.decorator.ts';
import { CreatePartnerDto } from './dtos/create-partner.dto.ts';
import { PartnerDto } from './dtos/partner.dto.ts';
import { PartnerService } from './partner.service.ts';

@Controller('partners')
@ApiTags('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  @PublicRoute()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: PartnerDto,
    description: 'Partnership proposal submitted',
  })
  @ApiBody({
    type: CreatePartnerDto,
    examples: {
      default: {
        summary: 'Submit partnership proposal',
        value: {
          companyName: 'Brico Pro SARL',
          fullName: 'Jean Dupont',
          email: 'contact@bricopro.tn',
          phone: '+21612345678',
          website: 'https://bricopro.tn',
          partnershipType: 'FOURNISSEUR',
          cityCountry: 'Tunis, Tunisie',
          description:
            'Nous proposons une gamme de matériaux de construction et souhaiterions devenir fournisseur officiel pour vos chantiers.',
        },
      },
    },
  })
  async createPartner(@Body() createPartnerDto: CreatePartnerDto): Promise<PartnerDto> {
    return this.partnerService.createPartner(createPartnerDto);
  }
}
