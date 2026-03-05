import { BudgetBracket } from '../../../constants/budget-bracket.ts';
import { PropertyType } from '../../../constants/property-type.ts';
import { RenovationType } from '../../../constants/renovation-type.ts';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLeadDtoStep1 {
  @IsString()
  projectAddress!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string | null;

  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @IsOptional()
  @IsArray()
  @IsEnum(RenovationType, { each: true })
  renovationTypes?: RenovationType[] | null;
}

export class CreateLeadDtoStep2 {
  @IsOptional()
  @IsNumber()
  @Min(0)
  surfaceM2?: number | null;

  @IsOptional()
  @IsEnum(BudgetBracket)
  budgetBracket?: BudgetBracket | null;

  @IsOptional()
  @IsString()
  description?: string | null;
}

export class CreateLeadDtoStep3 {
  @IsString()
  fullName!: string;

  @IsPhoneNumber()
  phone!: string;

  @IsOptional()
  @IsString()
  whatsapp?: string | null;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsBoolean()
  isAbroad?: boolean | null;
}

export class CreateLeadDto {
  @IsString()
  projectAddress!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string | null;

  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @IsOptional()
  @IsArray()
  @IsEnum(RenovationType, { each: true })
  renovationTypes?: RenovationType[] | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  surfaceM2?: number | null;

  @IsOptional()
  @IsEnum(BudgetBracket)
  budgetBracket?: BudgetBracket | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  fullName!: string;

  @IsPhoneNumber()
  phone!: string;

  @IsOptional()
  @IsString()
  whatsapp?: string | null;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsBoolean()
  isAbroad?: boolean | null;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  fileIds?: string[];
}

