import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { PublicRoute } from '../../decorators/public-route.decorator.ts';
import { CreateLeadDto } from './dtos/create-lead.dto.ts';
import { LeadDto } from './dtos/lead.dto.ts';
import { LeadService } from './lead.service.ts';

@Controller('leads')
@ApiTags('leads')
export class LeadController {
  constructor(private leadService: LeadService) {}

  @Post()
  @PublicRoute()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: LeadDto,
    description: 'Lead created from estimation form',
  })
  @ApiBody({
    type: CreateLeadDto,
    examples: {
      default: {
        summary: 'Example estimation request',
        value: {
          projectAddress: 'Résidence Les Jardins, La Marsa',
          city: 'Tunis',
          district: 'La Marsa',
          propertyType: 'APPARTEMENT',
          renovationTypes: ['SALLE_DE_BAIN', 'CUISINE'],
          surfaceM2: 85,
          budgetBracket: 'BETWEEN_20000_50000',
          description:
            'Rénovation complète salle de bain et cuisine, délais souhaités 3 mois.',
          fullName: 'Jean Dupont',
          phone: '+21612345678',
          whatsapp: '+21612345678',
          email: 'jean.dupont@example.com',
          isAbroad: true,
          fileIds: [
            'c4b8e0b8-1234-4d5e-9abc-1234567890ab',
            'd7a9e1f2-5678-4bcd-9abc-0987654321ff',
          ],
        },
      },
    },
  })
  async createLead(@Body() createLeadDto: CreateLeadDto): Promise<LeadDto> {
    return this.leadService.createLead(createLeadDto);
  }
}

