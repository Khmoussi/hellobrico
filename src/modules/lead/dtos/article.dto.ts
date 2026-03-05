import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { ArticleCategory } from '../../../constants/article-category.ts';

export class ArticleDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id!: string;

  @ApiProperty({
    maxLength: 255,
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

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  coverImageId?: string | null;

  @ApiProperty({ example: 'PUBLIE' })
  @IsString()
  status!: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  publishedAt?: Date | null;

  @ApiPropertyOptional({ type: File })
  @IsOptional()
  coverImage?: File | null;
}

