import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity.ts';
import { BudgetBracket } from '../../../constants/budget-bracket.ts';
import { ProjectStatus } from '../../../constants/project-status.ts';
import { ProjectStepStatus } from '../../../constants/project-step-status.ts';
import { PropertyType } from '../../../constants/property-type.ts';
import { RenovationType } from '../../../constants/renovation-type.ts';
import { File } from '../../files/entities/file.entity.ts';
import { UserEntity } from '../../user/user.entity.ts';
import { LeadEntity } from './lead.entity.ts';

@Entity({ name: 'projects' })
export class ProjectEntity extends AbstractEntity {
  @OneToOne(() => LeadEntity, (lead) => lead.convertedProject, {
    nullable: true,
  })
  lead!: LeadEntity | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'enum', enum: PropertyType })
  propertyType!: PropertyType;

  @Column({
    type: 'enum',
    enum: RenovationType,
    array: true,
    nullable: true,
  })
  renovationTypes!: RenovationType[] | null;

  @Column({ type: 'enum', enum: BudgetBracket, nullable: true })
  budgetBracket!: BudgetBracket | null;

  @Column({ type: 'enum', enum: ProjectStatus })
  status!: ProjectStatus;

  @Column({ type: 'int', default: 0 })
  overallProgress!: number;

  @ManyToOne(() => UserEntity, { nullable: true })
  supervisor!: UserEntity | null;

  @Column({ type: 'date', nullable: true })
  startDate!: Date | null;

  @Column({ type: 'date', nullable: true })
  endDate!: Date | null;

  @OneToMany(() => ProjectStepEntity, (step) => step.project)
  steps!: ProjectStepEntity[];

  @OneToMany(() => File, (file) => file.project)
  files!: File[];
}

@Entity({ name: 'project_steps' })
export class ProjectStepEntity extends AbstractEntity {
  @ManyToOne(() => ProjectEntity, (project) => project.steps, {
    nullable: false,
  })
  project!: ProjectEntity;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'int' })
  order!: number;

  @Column({ type: 'enum', enum: ProjectStepStatus })
  status!: ProjectStepStatus;

  @Column({ type: 'int', default: 0 })
  progress!: number;

  @Column({ type: 'date', nullable: true })
  plannedStart!: Date | null;

  @Column({ type: 'date', nullable: true })
  plannedEnd!: Date | null;

  @Column({ type: 'date', nullable: true })
  actualStart!: Date | null;

  @Column({ type: 'date', nullable: true })
  actualEnd!: Date | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdateAt!: Date;
}

