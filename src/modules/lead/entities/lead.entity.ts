import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity.ts';
import { BudgetBracket } from '../../../constants/budget-bracket.ts';
import { LeadHistoryType } from '../../../constants/lead-history-type.ts';
import { LeadStatus } from '../../../constants/lead-status.ts';
import { PropertyType } from '../../../constants/property-type.ts';
import { RenovationType } from '../../../constants/renovation-type.ts';
import { File } from '../../files/entities/file.entity.ts';
import { UserEntity } from '../../user/user.entity.ts';
import { ProjectEntity } from './project.entity.ts';

@Entity({ name: 'leads' })
export class LeadEntity extends AbstractEntity {
  @Column({ type: 'text' })
  projectAddress!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district!: string | null;

  @Column({ type: 'enum', enum: PropertyType })
  propertyType!: PropertyType;

  @Column({
    type: 'enum',
    enum: RenovationType,
    array: true,
    nullable: true,
  })
  renovationTypes!: RenovationType[] | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  surfaceM2!: string | null;

  @Column({ type: 'enum', enum: BudgetBracket, nullable: true })
  budgetBracket!: BudgetBracket | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 150 })
  fullName!: string;

  @Column({ type: 'varchar', length: 50 })
  phone!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  whatsapp!: string | null;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'boolean', default: false })
  isAbroad!: boolean;

  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.NOUVEAU })
  status!: LeadStatus;

  @ManyToOne(() => UserEntity, { nullable: true })
  assignedTo!: UserEntity | null;

  @Column({ type: 'varchar', length: 50, default: 'WEB_FORM' })
  source!: string;

  @Column({ type: 'text', nullable: true })
  lostReason!: string | null;

  @OneToOne(() => ProjectEntity, (project) => project.lead, {
    nullable: true,
  })
  convertedProject!: ProjectEntity | null;

  @OneToMany(() => LeadHistoryEntity, (history) => history.lead)
  history!: LeadHistoryEntity[];

  @OneToMany(() => File, (file) => file.lead)
  files!: File[];
}

@Entity({ name: 'lead_histories' })
export class LeadHistoryEntity extends AbstractEntity {
  @ManyToOne(() => LeadEntity, (lead) => lead.history, { nullable: false })
  lead!: LeadEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  user!: UserEntity | null;

  @Column({ type: 'enum', enum: LeadHistoryType })
  type!: LeadHistoryType;

  @Column({ type: 'enum', enum: LeadStatus, nullable: true })
  oldStatus!: LeadStatus | null;

  @Column({ type: 'enum', enum: LeadStatus, nullable: true })
  newStatus!: LeadStatus | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}

