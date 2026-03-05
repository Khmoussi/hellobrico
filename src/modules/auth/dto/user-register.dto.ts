import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';

import { IsPassword } from '../../../decorators/validator.decorators.ts';

export class UserRegisterDto {
  @IsString()
  readonly firstName!: string;

  @IsString()
  readonly lastName!: string;

  @IsEmail()
  readonly email!: string;

  @IsPassword()
  readonly password!: string;

  @IsPhoneNumber()
  phone?: string;
}
