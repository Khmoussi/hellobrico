import { Column, Entity, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity.ts';
import { File } from '../../files/entities/file.entity.ts';
import { UserEntity } from '../../user/user.entity.ts';
import { LeadEntity } from './lead.entity.ts';

@Entity({ name: 'quotes' })
export class Quote extends AbstractEntity {
  @ManyToOne(() => LeadEntity, { nullable: false })
  lead!: LeadEntity;

  @ManyToOne(() => File, { nullable: false })
  file!: File;

  @ManyToOne(() => UserEntity, { nullable: false })
  sentBy!: UserEntity;

  @Column({ type: 'timestamptz' })
  sentAt!: Date;

  @Column({ type: 'varchar', length: 255 })
  emailTo!: string;

  @Column({ type: 'varchar', length: 255 })
  emailSubject!: string;

  @Column({ type: 'text' })
  emailBody!: string;
}

