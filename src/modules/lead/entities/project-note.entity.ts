import { Column, Entity, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity.ts';
import { UserEntity } from '../../user/user.entity.ts';
import type{ ProjectEntity } from './project.entity.ts';

@Entity({ name: 'project_notes' })
export class ProjectNoteEntity extends AbstractEntity {
  @ManyToOne('ProjectEntity',(project:ProjectEntity) => project.notes, { onDelete: 'CASCADE' })
  project!: ProjectEntity;

  @Column({ type: 'text' })
  note!: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  user!: UserEntity | null;
}
