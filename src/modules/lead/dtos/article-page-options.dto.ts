import { IsEnum, IsOptional } from 'class-validator';

import { ArticleCategory } from '../../../constants/article-category.ts';
import { PageOptionsDto } from '../../../common/dto/page-options.dto.ts';

export class ArticlePageOptionsDto extends PageOptionsDto {
  @IsOptional()
  @IsEnum(ArticleCategory)
  category?: ArticleCategory;
}

