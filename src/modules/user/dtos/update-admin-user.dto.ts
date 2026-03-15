import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { RoleType } from '../../../constants/role-type.ts';
import { IsPassword } from '../../../decorators/validator.decorators.ts';

export class UpdateAdminUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()  lastName?: string;

  @IsEmail()
  @IsOptional()
    email?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsPassword()
  password?: string;

  @IsEnum(RoleType)
  @IsOptional()
  role?: RoleType;
}
