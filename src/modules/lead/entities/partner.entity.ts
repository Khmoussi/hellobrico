import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity.ts';
import { PartnershipType } from '../../../constants/partnership-type.ts';

@Entity({ name: 'partners' })
export class PartnerEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255 })
  companyName!: string;

  @Column({ type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ type: 'varchar', length: 255}) // add unique constraint
  email!: string;

  @Column({ type: 'varchar', length: 50 })
  phone!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website!: string | null;

  @Column({ type: 'enum', enum: PartnershipType })
  partnershipType!: PartnershipType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cityCountry!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo!: string | null;
}
