import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import {
  ClassFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators.ts';
import type { UserEntity } from '../../user/user.entity.ts';
import type { ProjectNoteEntity } from '../entities/project-note.entity.ts';

export class ProjectNoteUserDto {
  @StringField()
  id!: string;

  @StringFieldOptional({ nullable: true })
  firstName?: string | null;

  @StringFieldOptional({ nullable: true })
  lastName?: string | null;

  @StringFieldOptional({ nullable: true })
  email?: string | null;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.firstName = user.firstName ?? null;
    this.lastName = user.lastName ?? null;
    this.email = user.email ?? null;
  }
}

export class ProjectNoteDto extends AbstractDto {
  @StringField()
  note!: string;

  @ClassFieldOptional(() => ProjectNoteUserDto)
  user?: ProjectNoteUserDto | null;

  constructor(note: ProjectNoteEntity) {
    super(note);
    this.note = note.note;
    this.user = note.user
      ? new ProjectNoteUserDto(note.user)
      : null;
  }
}
