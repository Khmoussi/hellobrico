import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

import { PartnershipType } from '../../../constants/partnership-type.ts';

export class CreatePartnerDto {
  @ApiProperty({ example: 'Brico Pro SARL' })
  @IsString()
  @MaxLength(255)
  companyName!: string;

  @ApiProperty({ example: 'Jean Dupont' })
  @IsString()
  @MaxLength(255)
  fullName!: string;

  @ApiProperty({ example: 'contact@bricopro.tn' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+21612345678' })
  @IsPhoneNumber()
  phone!: string;

  @ApiPropertyOptional({ example: 'https://bricopro.tn' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  website?: string;

  @ApiProperty({ enum: PartnershipType })
  @IsEnum(PartnershipType)
  partnershipType!: PartnershipType;

  @ApiPropertyOptional({ example: 'Tunis, Tunisie' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  cityCountry?: string;

  @ApiPropertyOptional({ description: 'Description of the partnership proposal' })
  @IsOptional()
  @IsString()
  description?: string;
}
