import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../../constants/role-type.ts';
import { Auth } from '../../../decorators/http.decorators.ts';
import { DashboardKpisDto } from '../../lead/dtos/dashboard-kpis.dto.ts';
import { LeadDto } from '../../lead/dtos/lead.dto.ts';
import { LeadService } from '../../lead/lead.service.ts';

@Controller('admin/dashboard')
@ApiTags('admin-dashboard')
export class AdminDashboardController {
  constructor(private readonly leadService: LeadService) {}

  @Get('kpis')
  @Auth([RoleType.ADMIN, RoleType.SUPERVISOR, RoleType.COMMERCIAL])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: DashboardKpisDto,
    description: 'Dashboard KPIs: leads this month, quotes sent, conversion rate, active projects',
  })
  async getKpis(): Promise<DashboardKpisDto> {
    return this.leadService.getDashboardKpis();
  }

  @Get('recent-leads')
  @Auth([RoleType.ADMIN, RoleType.SUPERVISOR, RoleType.COMMERCIAL])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LeadDto,
    isArray: true,
    description: 'Recent leads list, newest first',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max number of leads (default 10, max 50)',
  })
  async getRecentLeads(
    @Query('limit') limit?: string,
  ): Promise<LeadDto[]> {
    const parsed = limit ? parseInt(limit, 10) : 10;
    return this.leadService.getRecentLeads(Number.isNaN(parsed) ? 10 : parsed);
  }
}
