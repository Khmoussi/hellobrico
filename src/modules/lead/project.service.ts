import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { PageDto } from '../../common/dto/page.dto.ts';
import { PageMetaDto } from '../../common/dto/page-meta.dto.ts';
import { LeadStatus } from '../../constants/lead-status.ts';
import { ProjectStatus } from '../../constants/project-status.ts';
import { ProjectStep } from '../../constants/project-step-status.ts';
import type { AddProjectNoteDto } from './dtos/add-project-note.dto.ts';
import { ProjectDto } from './dtos/project.dto.ts';
import type { ProjectsPageOptionsDto } from './dtos/projects-page-options.dto.ts';
import type { UpdateProjectStepDto } from './dtos/update-project-step.dto.ts';
import { LeadEntity } from './entities/lead.entity.ts';
import { ProjectEntity } from './entities/project.entity.ts';
import { ProjectNoteEntity } from './entities/project-note.entity.ts';
import { File } from '../files/entities/file.entity.ts';
import { UserEntity } from '../user/user.entity.ts';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,
    @InjectRepository(LeadEntity)
    private leadRepository: Repository<LeadEntity>,
    @InjectRepository(ProjectNoteEntity)
    private projectNoteRepository: Repository<ProjectNoteEntity>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Converts a lead to a project. Creates the project when lead status is CONVERTI.
   * If lead is not yet CONVERTI, sets status to CONVERTI and creates the project.
   */
  async createProjectFromLead(leadId: Uuid): Promise<ProjectDto> {
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['convertedProject', 'files'],
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    if (lead.convertedProject) {
      return this.getProjectById(lead.convertedProject.id);
    }

    const project = this.projectRepository.create({
      lead,
      name: lead.fullName || lead.projectAddress,
      address: lead.projectAddress,
      propertyType: lead.propertyType,
      renovationTypes: lead.renovationTypes ?? null,
      budgetBracket: lead.budgetBracket ?? null,
      status: ProjectStatus.EN_PREPARATION,
      currentStep: ProjectStep.VISITE_TECHNIQUE,
    });

    await this.projectRepository.save(project);

    lead.status = LeadStatus.CONVERTI;
    lead.convertedProject = project;
    await this.leadRepository.save(lead);

    if (lead.files?.length) {
      for (const file of lead.files) {
        file.project = project;
        file.lead = null;
      }
      await this.fileRepository.save(lead.files);
    }

    return this.getProjectById(project.id);
  }

  async getProjects(
    pageOptionsDto: ProjectsPageOptionsDto,
  ): Promise<PageDto<ProjectDto>> {
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.lead', 'lead')
      .leftJoinAndSelect('project.supervisor', 'supervisor')
      .leftJoinAndSelect('project.files', 'files');

    if (pageOptionsDto.status) {
      queryBuilder.andWhere('project.status = :status', {
        status: pageOptionsDto.status,
      });
    }

    if (pageOptionsDto.propertyType) {
      queryBuilder.andWhere('project.propertyType = :propertyType', {
        propertyType: pageOptionsDto.propertyType,
      });
    }

    if (pageOptionsDto.budgetBracket) {
      queryBuilder.andWhere('project.budgetBracket = :budgetBracket', {
        budgetBracket: pageOptionsDto.budgetBracket,
      });
    }

    if (pageOptionsDto.q) {
      queryBuilder.andWhere(
        '(LOWER(project.name) LIKE LOWER(:q) OR LOWER(project.address) LIKE LOWER(:q))',
        { q: `%${pageOptionsDto.q}%` },
      );
    }

    queryBuilder
      .orderBy('project.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [items, itemCount] = await queryBuilder.getManyAndCount();
    const meta = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(items.map((item) => new ProjectDto(item)), meta);
  }

  async getProjectById(id: Uuid): Promise<ProjectDto> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['lead', 'supervisor', 'files'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return new ProjectDto(project);
  }

  async updateProjectStep(
    id: Uuid,
    dto: UpdateProjectStepDto,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findOne({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    project.currentStep = dto.currentStep;
    await this.projectRepository.save(project);

    return this.getProjectById(id);
  }

  async addProjectNote(
    projectId: Uuid,
    dto: AddProjectNoteDto,
    userId?: Uuid,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const user = userId
      ? await this.userRepository.findOne({ where: { id: userId } }) ?? null
      : null;

    const note = this.projectNoteRepository.create({
      project,
      note: dto.note,
      user,
    });
    await this.projectNoteRepository.save(note);

    return this.getProjectById(projectId);
  }

  async assignSupervisor(projectId: Uuid, userId: Uuid): Promise<ProjectDto> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    project.supervisor = user;
    await this.projectRepository.save(project);

    return this.getProjectById(projectId);
  }
}
