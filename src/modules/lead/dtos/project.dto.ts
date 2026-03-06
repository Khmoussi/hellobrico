import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import {
  BooleanField,
  ClassFieldOptional,
  DateFieldOptional,
  EnumField,
  EnumFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators.ts';
import { BudgetBracket } from '../../../constants/budget-bracket.ts';
import { ProjectStatus } from '../../../constants/project-status.ts';
import { ProjectStep } from '../../../constants/project-step-status.ts';
import { PropertyType } from '../../../constants/property-type.ts';
import { RenovationType } from '../../../constants/renovation-type.ts';
import type { File } from '../../files/entities/file.entity.ts';
import type { UserEntity } from '../../user/user.entity.ts';
import type { ProjectEntity } from '../entities/project.entity.ts';

export class ProjectFileDto {
  @StringField()
  id!: string;

  @StringField()
  publicUrl!: string;

  @StringField()
  protectedUrl!: string;

  @StringField()
  mimetype!: string;

  @StringField()
  filename!: string;

  constructor(file: File) {
    this.id = file.id;
    this.publicUrl = file.public_url;
    this.protectedUrl = file.protected_url;
    this.mimetype = file.mimetype;
    this.filename = file.filename;
  }
}

export class ProjectSupervisorDto {
  @StringField()
  id!: string;

  @StringFieldOptional({ nullable: true })
  firstName?: string | null;

  @StringFieldOptional({ nullable: true })
  lastName?: string | null;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }
}

export class ProjectStepDto {
  @EnumField(() => ProjectStep)
  step!: ProjectStep;

  @StringField()
  label!: string;

  @BooleanField()
  isCurrent!: boolean;

  constructor(step: ProjectStep, isCurrent: boolean) {
    this.step = step;
    this.label = step;
    this.isCurrent = isCurrent;
  }
}

export class ProjectDto extends AbstractDto {
  @StringFieldOptional({ nullable: true })
  leadId?: string | null;

  @StringField()
  name!: string;

  @StringField()
  address!: string;

  @EnumField(() => PropertyType)
  propertyType!: PropertyType;

  @EnumFieldOptional(() => RenovationType, { each: true, nullable: true })
  renovationTypes?: RenovationType[] | null;

  @EnumFieldOptional(() => BudgetBracket, { nullable: true })
  budgetBracket?: BudgetBracket | null;

  @EnumField(() => ProjectStatus)
  status!: ProjectStatus;

  @ClassFieldOptional(() => ProjectSupervisorDto)
  supervisor?: ProjectSupervisorDto | null;

  @DateFieldOptional({ nullable: true })
  startDate?: Date | null;

  @DateFieldOptional({ nullable: true })
  endDate?: Date | null;

  @EnumField(() => ProjectStep)
  currentStep!: ProjectStep;

  @ClassFieldOptional(() => ProjectStepDto, { each: true })
  steps?: ProjectStepDto[];

  @ClassFieldOptional(() => ProjectFileDto, { each: true })
  files?: ProjectFileDto[];

  constructor(project: ProjectEntity) {
    super(project);
    this.leadId = project.lead?.id ?? null;
    this.name = project.name;
    this.address = project.address;
    this.propertyType = project.propertyType;
    this.renovationTypes = project.renovationTypes ?? null;
    this.budgetBracket = project.budgetBracket ?? null;
    this.status = project.status;
    this.supervisor = project.supervisor
      ? new ProjectSupervisorDto(project.supervisor)
      : null;
    this.startDate = project.startDate ?? null;
    this.endDate = project.endDate ?? null;
    this.currentStep = project.currentStep;
    this.steps = Object.values(ProjectStep).map(
      (step) => new ProjectStepDto(step, step === project.currentStep),
    );
    this.files = project.files?.map((f) => new ProjectFileDto(f)) ?? [];
  }
}
