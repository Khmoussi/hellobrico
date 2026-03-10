import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto.ts';
import { RoleType } from '../../../constants/role-type.ts';
import { ApiPageResponse } from '../../../decorators/api-page-response.decorator.ts';
import { Auth, UUIDParam } from '../../../decorators/http.decorators.ts';
import { CurrentUser } from '../../../decorators/user.dcorator.ts';
import { AddProjectNoteDto } from '../../lead/dtos/add-project-note.dto.ts';
import { AssignSupervisorDto } from '../../lead/dtos/assign-supervisor.dto.ts';
import { ProjectDto } from '../../lead/dtos/project.dto.ts';
import { ProjectNoteDto } from '../../lead/dtos/project-note.dto.ts';
import { ProjectsPageOptionsDto } from '../../lead/dtos/projects-page-options.dto.ts';
import { UpdateProjectStepDto } from '../../lead/dtos/update-project-step.dto.ts';
import { UpdateProjectStatusDto } from '../../lead/dtos/update-project-status.dto.ts';
import { ProjectService } from '../../lead/project.service.ts';
import type { UserEntity } from '../../user/user.entity.ts';

@Controller('admin/projects')
@ApiTags('admin-projects')
export class AdminProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageResponse({
    description: 'Paginated list of projects for backoffice',
    type: PageDto,
  })
  async getProjects(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: ProjectsPageOptionsDto,
  ): Promise<PageDto<ProjectDto>> {
    return this.projectService.getProjects(pageOptionsDto);
  }

  @Post('from-lead/:leadId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    type: ProjectDto,
    description: 'Project created from lead',
  })
  @ApiParam({ name: 'leadId', type: 'string', format: 'uuid', required: true })
  async createFromLead(
    @UUIDParam('leadId') leadId: Uuid,
  ): Promise<ProjectDto> {
    return this.projectService.createProjectFromLead(leadId);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProjectDto, description: 'Project by id' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async getById(@UUIDParam('id') id: Uuid): Promise<ProjectDto> {
    return this.projectService.getProjectById(id);
  }

  @Patch(':id/status')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProjectDto, description: 'Project status updated' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  @ApiBody({ type: UpdateProjectStatusDto })
  async updateStatus(
    @UUIDParam('id') id: Uuid,
    @Body() dto: UpdateProjectStatusDto,
  ): Promise<ProjectDto> {
    return this.projectService.updateProjectStatus(id, dto);
  }

  @Patch(':id/step')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProjectDto, description: 'Project step updated' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  @ApiBody({ type: UpdateProjectStepDto })
  async updateStep(
    @UUIDParam('id') id: Uuid,
    @Body() dto: UpdateProjectStepDto,
  ): Promise<ProjectDto> {
    return this.projectService.updateProjectStep(id, dto);
  }

  @Get(':id/notes')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ProjectNoteDto,
    isArray: true,
    description: 'Notes for the project',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async getNotes(@UUIDParam('id') id: Uuid): Promise<ProjectNoteDto[]> {
    return this.projectService.getProjectNotes(id);
  }

  @Post(':id/notes')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProjectDto, description: 'Note added to project' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  @ApiBody({ type: AddProjectNoteDto })
  async addNote(
    @UUIDParam('id') id: Uuid,
    @Body() dto: AddProjectNoteDto,
    @CurrentUser() user?: UserEntity,
  ): Promise<ProjectDto> {
    return this.projectService.addProjectNote(id, dto, user?.id);
  }

  @Patch(':id/supervisor')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProjectDto, description: 'Project supervisor assigned' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  @ApiBody({ type: AssignSupervisorDto })
  async assignSupervisor(
    @UUIDParam('id') id: Uuid,
    @Body() dto: AssignSupervisorDto,
  ): Promise<ProjectDto> {
    return this.projectService.assignSupervisor(id, dto);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOkResponse({ description: 'Project deleted' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async delete(@UUIDParam('id') id: Uuid): Promise<void> {
    return this.projectService.deleteProject(id);
  }
}
