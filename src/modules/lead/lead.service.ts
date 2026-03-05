import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, type Repository } from 'typeorm';

import { PageDto } from '../../common/dto/page.dto.ts';
import { PageMetaDto } from '../../common/dto/page-meta.dto.ts';
import type { AddLeadNoteDto } from './dtos/add-lead-note.dto.ts';
import type { AssignLeadDto } from './dtos/assign-lead.dto.ts';
import type { CreateLeadDto } from './dtos/create-lead.dto.ts';
import { LeadDto } from './dtos/lead.dto.ts';
import { LeadsPageOptionsDto } from './dtos/leads-page-options.dto.ts';
import type { UpdateLeadStatusDto } from './dtos/update-lead-status.dto.ts';
import { LeadHistoryType } from '../../constants/lead-history-type.ts';
import { LeadStatus } from '../../constants/lead-status.ts';
import { LeadEntity, LeadHistoryEntity } from './entities/lead.entity.ts';
import { File } from '../files/entities/file.entity.ts';
import { UserEntity } from '../user/user.entity.ts';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(LeadEntity)
    private leadRepository: Repository<LeadEntity>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(LeadHistoryEntity)
    private leadHistoryRepository: Repository<LeadHistoryEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createLead(createLeadDto: CreateLeadDto): Promise<LeadDto> {
    const leadEntity = this.leadRepository.create({
      projectAddress: createLeadDto.projectAddress,
      city: createLeadDto.city ?? null,
      district: createLeadDto.district ?? null,
      propertyType: createLeadDto.propertyType,
      renovationTypes: createLeadDto.renovationTypes ?? null,
      surfaceM2:
        typeof createLeadDto.surfaceM2 === 'number'
          ? String(createLeadDto.surfaceM2)
          : null,
      budgetBracket: createLeadDto.budgetBracket ?? null,
      description: createLeadDto.description ?? null,
      fullName: createLeadDto.fullName,
      phone: createLeadDto.phone,
      whatsapp: createLeadDto.whatsapp ?? null,
      email: createLeadDto.email,
      isAbroad: Boolean(createLeadDto.isAbroad),
    });

    await this.leadRepository.save(leadEntity);

    if (
      createLeadDto.fileIds &&
      Array.isArray(createLeadDto.fileIds) &&
      createLeadDto.fileIds.length > 0
    ) {
      const files = await this.fileRepository.find({
        where: { id: In(createLeadDto.fileIds) },
      });
      for (const file of files) {
        file.lead = leadEntity;
      }
      await this.fileRepository.save(files);
    }

    const saved = await this.leadRepository.findOne({
      where: { id: leadEntity.id },
      relations: ['files'],
    });
    this.eventEmitter.emit('lead.created', { lead: saved! });
    return new LeadDto(saved!);
  }

  async getLeadById(id: Uuid): Promise<LeadDto> {
    const lead = await this.leadRepository.findOne({
      where: { id },
      relations: ['files'],
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return new LeadDto(lead);
  }

  async getLeads(
    pageOptionsDto: LeadsPageOptionsDto,
  ): Promise<PageDto<LeadDto>> {
    const queryBuilder = this.leadRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.files', 'files');

    if (pageOptionsDto.status) {
      queryBuilder.andWhere('lead.status = :status', {
        status: pageOptionsDto.status,
      });
    }

    if (pageOptionsDto.propertyType) {
      queryBuilder.andWhere('lead.propertyType = :propertyType', {
        propertyType: pageOptionsDto.propertyType,
      });
    }

    if (pageOptionsDto.budgetBracket) {
      queryBuilder.andWhere('lead.budgetBracket = :budgetBracket', {
        budgetBracket: pageOptionsDto.budgetBracket,
      });
    }

    if (typeof pageOptionsDto.isAbroad === 'boolean') {
      queryBuilder.andWhere('lead.isAbroad = :isAbroad', {
        isAbroad: pageOptionsDto.isAbroad,
      });
    }

    if (pageOptionsDto.q) {
      queryBuilder.andWhere(
        '(LOWER(lead.fullName) LIKE LOWER(:q) OR LOWER(lead.projectAddress) LIKE LOWER(:q))',
        { q: `%${pageOptionsDto.q}%` },
      );
    }

    queryBuilder
      .orderBy('lead.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [items, itemCount] = await queryBuilder.getManyAndCount();
    const meta = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(items.map((item) => new LeadDto(item)), meta);
  }

  async updateLeadStatus(
    id: Uuid,
    dto: UpdateLeadStatusDto,
    userId?: Uuid,
  ): Promise<LeadDto> {
    const lead = await this.leadRepository.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    const oldStatus = lead.status;
    lead.status = dto.status;
    if (dto.status === LeadStatus.PERDU && dto.lostReason != null) {
      lead.lostReason = dto.lostReason;
    } else if (dto.status !== LeadStatus.PERDU) {
      lead.lostReason = null;
    }

    await this.leadRepository.save(lead);

    const history = this.leadHistoryRepository.create({
      lead,
      type: LeadHistoryType.STATUS_CHANGE,
      oldStatus,
      newStatus: dto.status,
      user: userId
        ? await this.userRepository.findOne({ where: { id: userId } }) ?? null
        : null,
    });
    await this.leadHistoryRepository.save(history);

    const updated = await this.leadRepository.findOne({
      where: { id },
      relations: ['files'],
    });
    return new LeadDto(updated!);
  }

  async assignLead(id: Uuid, dto: AssignLeadDto): Promise<LeadDto> {
    const lead = await this.leadRepository.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    if (dto.assignedToId == null || dto.assignedToId === '') {
      lead.assignedTo = null;
    } else {
      const user = await this.userRepository.findOne({
        where: { id: dto.assignedToId as Uuid },
      });
      if (!user) throw new NotFoundException('User not found');
      lead.assignedTo = user;
    }

    await this.leadRepository.save(lead);

    const updated = await this.leadRepository.findOne({
      where: { id },
      relations: ['files'],
    });
    return new LeadDto(updated!);
  }

  async addLeadNote(
    id: Uuid,
    dto: AddLeadNoteDto,
    userId?: Uuid,
  ): Promise<LeadDto> {
    const lead = await this.leadRepository.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    const user = userId
      ? await this.userRepository.findOne({ where: { id: userId } }) ?? null
      : null;

    const history = this.leadHistoryRepository.create({
      lead,
      type: LeadHistoryType.NOTE,
      note: dto.note,
      user,
    });
    await this.leadHistoryRepository.save(history);

    const updated = await this.leadRepository.findOne({
      where: { id },
      relations: ['files'],
    });
    return new LeadDto(updated!);
  }
}

