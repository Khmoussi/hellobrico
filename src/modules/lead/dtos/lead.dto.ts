import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import {
  BooleanFieldOptional,
  ClassFieldOptional,
  EmailField,
  EnumField,
  EnumFieldOptional,
  NumberFieldOptional,
  PhoneField,
  StringField,
  StringFieldOptional,
  TextAreaFieldOptional,
} from '../../../decorators/field.decorators.ts';
import { BudgetBracket } from '../../../constants/budget-bracket.ts';
import { LeadStatus } from '../../../constants/lead-status.ts';
import { PropertyType } from '../../../constants/property-type.ts';
import { RenovationType } from '../../../constants/renovation-type.ts';
import type { File } from '../../files/entities/file.entity.ts';
import { LeadEntity } from '../entities/lead.entity.ts';

export class LeadFileDto {
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

  @NumberFieldOptional()
  size!: number;

  constructor(file: File) {
    this.id = file.id;
    this.publicUrl = file.public_url;
    this.protectedUrl = file.protected_url;
    this.mimetype = file.mimetype;
    this.filename = file.filename;
    this.size = file.size;
  }
}

export class LeadDto extends AbstractDto {
  @StringField()
  projectAddress!: string;

  @StringFieldOptional({ nullable: true })
  city?: string | null;

  @StringFieldOptional({ nullable: true })
  district?: string | null;

  @EnumField(() => PropertyType)
  propertyType!: PropertyType;

  @EnumFieldOptional(() => RenovationType, { each: true, nullable: true })
  renovationTypes?: RenovationType[] | null;

  @StringFieldOptional({ nullable: true })
  surfaceM2?: string | null;

  @EnumFieldOptional(() => BudgetBracket, { nullable: true })
  budgetBracket?: BudgetBracket | null;

  @TextAreaFieldOptional({ nullable: true })
  description?: string | null;

  @StringField()
  fullName!: string;

  @PhoneField()
  phone!: string;

  @StringFieldOptional({ nullable: true })
  whatsapp?: string | null;

  @EmailField()
  email!: string;

  @BooleanFieldOptional()
  isAbroad?: boolean | null;

  @EnumField(() => LeadStatus)
  status!: LeadStatus;

  @ClassFieldOptional(() => LeadFileDto, { each: true })
  files?: LeadFileDto[];

  constructor(lead: LeadEntity) {
    super(lead);
    this.projectAddress = lead.projectAddress;
    this.city = lead.city;
    this.district = lead.district;
    this.propertyType = lead.propertyType;
    this.renovationTypes = lead.renovationTypes ?? null;
    this.surfaceM2 = lead.surfaceM2;
    this.budgetBracket = lead.budgetBracket ?? null;
    this.description = lead.description;
    this.fullName = lead.fullName;
    this.phone = lead.phone;
    this.whatsapp = lead.whatsapp;
    this.email = lead.email;
    this.isAbroad = lead.isAbroad;
    this.status = lead.status;
    this.files = lead.files?.map((f) => new LeadFileDto(f)) ?? [];
  }
}

