import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PageDto } from '../../common/dto/page.dto.ts';
import { PageMetaDto } from '../../common/dto/page-meta.dto.ts';
import type { CreatePartnerDto } from './dtos/create-partner.dto.ts';
import { PartnerDto } from './dtos/partner.dto.ts';
import type { PartnersPageOptionsDto } from './dtos/partners-page-options.dto.ts';
import type { UpdatePartnerDto } from './dtos/update-partner.dto.ts';
import { PartnerEntity } from './entities/partner.entity.ts';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(PartnerEntity)
    private partnerRepository: Repository<PartnerEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createPartner(createPartnerDto: CreatePartnerDto): Promise<PartnerDto> {
    const entity = this.partnerRepository.create({
      companyName: createPartnerDto.companyName,
      fullName: createPartnerDto.fullName,
      email: createPartnerDto.email,
      phone: createPartnerDto.phone,
      website: createPartnerDto.website ?? null,
      partnershipType: createPartnerDto.partnershipType,
      cityCountry: createPartnerDto.cityCountry ?? null,
      description: createPartnerDto.description ?? null,
    });
    const saved = await this.partnerRepository.save(entity);
    this.eventEmitter.emit('partner.created', { partner: saved });
    return new PartnerDto(saved);
  }

  async getPartners(
    pageOptionsDto: PartnersPageOptionsDto,
  ): Promise<PageDto<PartnerDto>> {
    const queryBuilder = this.partnerRepository.createQueryBuilder('partner');

    if (pageOptionsDto.partnershipType) {
      queryBuilder.andWhere('partner.partnershipType = :partnershipType', {
        partnershipType: pageOptionsDto.partnershipType,
      });
    }

    if (pageOptionsDto.q) {
      queryBuilder.andWhere(
        '(LOWER(partner.companyName) LIKE LOWER(:q) OR LOWER(partner.fullName) LIKE LOWER(:q) OR LOWER(partner.email) LIKE LOWER(:q))',
        { q: `%${pageOptionsDto.q}%` },
      );
    }

    queryBuilder
      .orderBy('partner.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [items, itemCount] = await queryBuilder.getManyAndCount();
    const meta = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(items.map((item) => new PartnerDto(item)), meta);
  }

  async getPartnerById(id: Uuid): Promise<PartnerDto> {
    const partner = await this.partnerRepository.findOne({ where: { id } });
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }
    return new PartnerDto(partner);
  }

  async updatePartner(id: Uuid, dto: UpdatePartnerDto): Promise<PartnerDto> {
    const partner = await this.partnerRepository.findOne({ where: { id } });
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }
    if (dto.logo !== undefined) partner.logo = dto.logo;
    const saved = await this.partnerRepository.save(partner);
    return new PartnerDto(saved);
  }

  async deletePartner(id: Uuid): Promise<void> {
    const result = await this.partnerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Partner not found');
    }
  }
}
