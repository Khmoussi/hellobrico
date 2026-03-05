import { IsEmail } from 'class-validator';
import { IsPassword } from '../../../decorators/validator.decorators.ts';

export class UserLoginDto {
    @IsEmail()
    readonly email!: string;

  @IsPassword()
  readonly password!: string;
}
