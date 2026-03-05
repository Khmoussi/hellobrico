import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { ArticleCategory } from '../../../constants/article-category.ts';

export class CreateArticleDto {
  @ApiProperty({
    example: 'Comment structurer une rénovation complète sans dépassement',
  })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    example:
      'Une rénovation réussie commence par un devis structuré et une planification claire.',
  })
  @IsOptional()
  @IsString()
  excerpt?: string | null;

  @ApiProperty({
    example:
      'Contenu long de l’article en HTML ou Markdown, avec sections H2/H3…',
  })
  @IsString()
  content!: string;

  @ApiProperty({
    enum: ArticleCategory,
    example: ArticleCategory.BUDGET_PLANIFICATION,
  })
  @IsEnum(ArticleCategory)
  category!: ArticleCategory;

  @ApiPropertyOptional({
    format: 'uuid',
    example: 'c4b8e0b8-1234-4d5e-9abc-1234567890ab',
  })
  @IsOptional()
  @IsUUID()
  coverImageId?: string | null;
}

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  excerpt?: string | null;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(ArticleCategory)
  category?: ArticleCategory;

  @IsOptional()
  @IsUUID()
  coverImageId?: string | null;

  @IsOptional()
  @IsString()
  status?: 'BROUILLON' | 'PUBLIE';
}

