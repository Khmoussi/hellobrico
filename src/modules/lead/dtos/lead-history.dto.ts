import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LeadHistoryType } from '../../../constants/lead-history-type.ts';
import { LeadStatus } from '../../../constants/lead-status.ts';
import type { LeadHistoryEntity } from '../entities/lead.entity.ts';
import type { UserEntity } from '../../user/user.entity.ts';

export class LeadHistoryUserDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  firstName?: string | null;

  @ApiPropertyOptional()
  lastName?: string | null;

  @ApiPropertyOptional()
  email?: string | null;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
  }
}

export class LeadHistoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ enum: LeadHistoryType })
  type!: LeadHistoryType;

  @ApiPropertyOptional({ enum: LeadStatus })
  oldStatus?: LeadStatus | null;

  @ApiPropertyOptional({ enum: LeadStatus })
  newStatus?: LeadStatus | null;

  @ApiPropertyOptional()
  note?: string | null;

  @ApiPropertyOptional({ type: LeadHistoryUserDto })
  user?: LeadHistoryUserDto | null;

  constructor(history: LeadHistoryEntity) {
    this.id = history.id;
    this.createdAt = history.createdAt;
    this.type = history.type;
    this.oldStatus = history.oldStatus;
    this.newStatus = history.newStatus;
    this.note = history.note;
    this.user = history.user ? new LeadHistoryUserDto(history.user) : null;
  }
}
