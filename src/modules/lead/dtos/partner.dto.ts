import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import { PartnershipType } from '../../../constants/partnership-type.ts';
import {
  EmailField,
  EnumField,
  PhoneField,
  StringField,
  StringFieldOptional,
  TextAreaFieldOptional,
} from '../../../decorators/field.decorators.ts';
import type { PartnerEntity } from '../entities/partner.entity.ts';

export class PartnerDto extends AbstractDto {
  @StringField()
  companyName!: string;

  @StringField()
  fullName!: string;

  @EmailField()
  email!: string;

  @PhoneField()
  phone!: string;

  @StringFieldOptional({ nullable: true })
  website?: string | null;

  @EnumField(() => PartnershipType)
  partnershipType!: PartnershipType;

  @StringFieldOptional({ nullable: true })
  cityCountry?: string | null;

  @TextAreaFieldOptional({ nullable: true })
  description?: string | null;

  @StringFieldOptional({ nullable: true })
  logo?: string | null;

  constructor(partner: PartnerEntity) {
    super(partner);
    this.companyName = partner.companyName;
    this.fullName = partner.fullName;
    this.email = partner.email;
    this.phone = partner.phone;
    this.website = partner.website;
    this.partnershipType = partner.partnershipType;
    this.cityCountry = partner.cityCountry;
    this.description = partner.description;
    this.logo = partner.logo;
  }
}
