import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity.ts';
import { BudgetBracket } from '../../../constants/budget-bracket.ts';
import { ProjectStatus } from '../../../constants/project-status.ts';
import { ProjectStep } from '../../../constants/project-step-status.ts';
import { PropertyType } from '../../../constants/property-type.ts';
import { RenovationType } from '../../../constants/renovation-type.ts';
import { File } from '../../files/entities/file.entity.ts';
import { UserEntity } from '../../user/user.entity.ts';
import { LeadEntity } from './lead.entity.ts';
import { ProjectNoteEntity } from './project-note.entity.ts';

@Entity({ name: 'projects' })
export class ProjectEntity extends AbstractEntity {
  @OneToOne(() => LeadEntity, (lead) => lead.convertedProject, {
    nullable: true,
  })
  @JoinColumn({ name: 'lead_id' })
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

 
  @ManyToOne(() => UserEntity, { nullable: true })
  supervisor!: UserEntity | null;

  @Column({ type: 'date', nullable: true })
  startDate!: Date | null;

  @Column({ type: 'date', nullable: true })
  endDate!: Date | null;

  @Column({ type: 'enum', enum: ProjectStep })
  currentStep!: ProjectStep;

  @OneToMany(() => File, (file) => file.project)
  files!: File[];

  @OneToMany(() => ProjectNoteEntity, (note) => note.project)
  notes!: ProjectNoteEntity[];
}



