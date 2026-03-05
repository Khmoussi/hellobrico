
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VirtualColumn,
} from 'typeorm';

import { LeadEntity } from '../../lead/entities/lead.entity.ts';
import { ProjectEntity } from '../../lead/entities/project.entity.ts';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  mimetype!: string;

  @Column()
  filename!: string;

  @Column({ select: false })
  originalname!: string;

  @Column({ nullable: true })
  extension?: string;

  @Column()
  size!: number;

  @Column({ select: false, nullable: true })
  destination?: string;

  @Column()
  protected_url!: string;

  @Column()
  public_url!: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @ManyToOne(() => LeadEntity, (lead) => lead.files, { nullable: true })
  lead?: LeadEntity | null;

  @ManyToOne(() => ProjectEntity, (project) => project.files, {
    nullable: true,
  })
  project?: ProjectEntity | null;

  @VirtualColumn({
    query: (alias) => `'${process.env.SERVER_URL}' || ${alias}.imageUrl`,
  })
  fullImageUrl!: string;

  @BeforeInsert()
  setFileUrls() {
    if (!this.protected_url) {
      this.protected_url = `/files/${this.filename}/download`;
    }

    if (!this.public_url) {
      this.public_url = `/public/uploads/${this.filename}`;
    }
  }
}
