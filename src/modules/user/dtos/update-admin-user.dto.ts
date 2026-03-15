import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

import { RoleType } from '../../../constants/role-type.ts';
import { IsPassword } from '../../../decorators/validator.decorators.ts';

export class UpdateAdminUserDto {
  @ApiPropertyOptional({ example: 'Marie' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Martin' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'marie.martin@hellobrico.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+21612345678' })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'NewSecureP@ss123', description: 'New password (min 6 chars)' })
  @IsOptional()
  @IsPassword()
  password?: string;

  @ApiPropertyOptional({ enum: RoleType })
  @IsEnum(RoleType)
  @IsOptional()
  role?: RoleType;
}
