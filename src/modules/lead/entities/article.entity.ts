import { Column, Entity, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity.ts';
import { ArticleCategory } from '../../../constants/article-category.ts';
import { File } from '../../files/entities/file.entity.ts';
import { UserEntity } from '../../user/user.entity.ts';

@Entity({ name: 'articles' })
export class ArticleEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  excerpt!: string | null;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'enum', enum: ArticleCategory })
  category!: ArticleCategory;

  @ManyToOne(() => File, { nullable: true })
  coverImage!: File | null;

  @ManyToOne(() => UserEntity, { nullable: false })
  author!: UserEntity;

  @Column({
    type: 'enum',
    enum: ['BROUILLON', 'PUBLIE'],
    default: 'BROUILLON',
  })
  status!: 'BROUILLON' | 'PUBLIE';

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;
}

