import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto.ts';
import { RoleType } from '../../../constants/role-type.ts';
import { Auth, UUIDParam } from '../../../decorators/http.decorators.ts';
import { CurrentUser } from '../../../decorators/user.dcorator.ts';
import { AddLeadNoteDto } from '../../lead/dtos/add-lead-note.dto.ts';
import { AssignLeadDto } from '../../lead/dtos/assign-lead.dto.ts';
import { LeadDto } from '../../lead/dtos/lead.dto.ts';
import { LeadHistoryDto } from '../../lead/dtos/lead-history.dto.ts';
import { LeadsPageOptionsDto } from '../../lead/dtos/leads-page-options.dto.ts';
import { UpdateLeadStatusDto } from '../../lead/dtos/update-lead-status.dto.ts';
import { LeadService } from '../../lead/lead.service.ts';
import type { UserEntity } from '../../user/user.entity.ts';

@Controller('admin/leads')
@ApiTags('admin-leads')
export class AdminLeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: PageDto,
    description: 'Paginated list of leads for backoffice',
  })
  async getLeads(
    @Query() pageOptionsDto: LeadsPageOptionsDto,
  ): Promise<PageDto<LeadDto>> {
    return this.leadService.getLeads(pageOptionsDto);
  }

  @Get(':id/notes')
  @Auth([RoleType.ADMIN, RoleType.SUPERVISOR, RoleType.COMMERCIAL])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LeadHistoryDto,
    isArray: true,
    description: 'Notes for the lead (history entries with type NOTE)',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async getLeadNotes(@UUIDParam('id') id: Uuid): Promise<LeadHistoryDto[]> {
    const notes = await this.leadService.getLeadNotes(id);
    return notes.map((n) => new LeadHistoryDto(n));
  }

  @Get(':id/history')
  @Auth([RoleType.ADMIN, RoleType.SUPERVISOR, RoleType.COMMERCIAL])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LeadHistoryDto,
    isArray: true,
    description: 'Full history for the lead (status changes, notes, etc.)',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async getLeadHistory(@UUIDParam('id') id: Uuid): Promise<LeadHistoryDto[]> {
    const history = await this.leadService.getLeadHistory(id);
    return history.map((h) => new LeadHistoryDto(h));
  }

  @Get(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LeadDto, description: 'Lead by id' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async getLead(@UUIDParam('id') id: Uuid): Promise<LeadDto> {
    return this.leadService.getLeadById(id);
  }

  @Patch(':id/status')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LeadDto, description: 'Lead status updated' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  @ApiBody({
    type: UpdateLeadStatusDto,
    examples: {
      default: {
        summary: 'Change status to CONTACTE',
        value: { status: 'CONTACTE' },
      },
      perdu: {
        summary: 'Mark as PERDU with reason',
        value: { status: 'PERDU', lostReason: 'Budget trop élevé' },
      },
    },
  })
  async updateLeadStatus(
    @UUIDParam('id') id: Uuid,
    @Body() dto: UpdateLeadStatusDto,
    @CurrentUser() user?: UserEntity,
  ): Promise<LeadDto> {
    return this.leadService.updateLeadStatus(id, dto, user?.id);
  }

  @Patch(':id/assign')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LeadDto, description: 'Lead assignment updated' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  @ApiBody({
    type: AssignLeadDto,
    examples: {
      assign: {
        summary: 'Assign to user',
        value: { assignedToId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
      },
      unassign: {
        summary: 'Unassign',
        value: {},
      },
    },
  })
  async assignLead(
    @UUIDParam('id') id: Uuid,
    @Body() dto: AssignLeadDto,
  ): Promise<LeadDto> {
    return this.leadService.assignLead(id, dto);
  }

  @Patch(':id/assign/unassign')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LeadDto, description: 'Lead unassigned' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async unassignLead(@UUIDParam('id') id: Uuid): Promise<LeadDto> {
    return this.leadService.unassignLead(id);
  }

  @Post(':id/notes')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LeadDto, description: 'Note added to lead' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  @ApiBody({
    type: AddLeadNoteDto,
    examples: {
      default: {
        summary: 'Add internal note',
        value: {
          note: 'Client rappelé, visite programmée jeudi 14h.',
        },
      },
    },
  })
  async addLeadNote(
    @UUIDParam('id') id: Uuid,
    @Body() dto: AddLeadNoteDto,
    @CurrentUser() user?: UserEntity,
  ): Promise<LeadDto> {
    return this.leadService.addLeadNote(id, dto, user?.id);
  }


}

