import { Injectable, NotFoundException } from '@nestjs/common';

import { PageDto } from '../../common/dto/page.dto.ts';
import { PageMetaDto } from '../../common/dto/page-meta.dto.ts';
import type { ArticlePageOptionsDto } from './dtos/article-page-options.dto.ts';
import { ArticleDto } from './dtos/article.dto.ts';
import {
  CreateArticleDto,
  UpdateArticleDto,
} from './dtos/create-article.dto.ts';
import { ArticleEntity } from './entities/article.entity.ts';
import type { UserEntity } from '../user/user.entity.ts';
import { FilesService } from '../files/files.service.ts';
import { ArticleRepository } from './repositories/article.repository.ts';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly filesService: FilesService,
  ) {}

  private toDto(entity: ArticleEntity): ArticleDto {
    const dto = new ArticleDto();

    dto.id = entity.id;
    dto.title = entity.title;
    dto.excerpt = entity.excerpt;
    dto.content = entity.content;
    dto.category = entity.category;
    dto.coverImageId = entity.coverImage ? entity.coverImage.id : null;
    dto.status = entity.status;
    dto.publishedAt = entity.publishedAt;
    dto.coverImage = entity.coverImage as File | null;
    return dto;
  }

  async getPublishedArticles(
    pageOptionsDto: ArticlePageOptionsDto,
  ): Promise<PageDto<ArticleDto>> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.coverImage', 'coverImage')
      .where('article.status = :status', { status: 'PUBLIE' });

    if (pageOptionsDto.category) {
      queryBuilder.andWhere('article.category = :category', {
        category: pageOptionsDto.category,
      });
    }

    queryBuilder
      .orderBy('article.publishedAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [items, itemCount] = await queryBuilder.getManyAndCount();
    const meta = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(items.map((item) => this.toDto(item)), meta);
  }

  async getPublishedById(id: Uuid): Promise<ArticleDto> {
    const entity = await this.articleRepository.findOne({
      where: { id, status: 'PUBLIE' },
      relations: ['coverImage'],
    });

    if (!entity) {
      throw new NotFoundException('Article not found');
    }

    return this.toDto(entity);
  }

  async createArticle(
    createArticleDto: CreateArticleDto,
    author: UserEntity,
  ): Promise<ArticleDto> {
    const article = this.articleRepository.create({
      title: createArticleDto.title,
      excerpt: createArticleDto.excerpt ?? null,
      content: createArticleDto.content,
      category: createArticleDto.category,
      author,
    });

    if (createArticleDto.coverImageId) {
      const file = await this.filesService.findOneById(
        createArticleDto.coverImageId as Uuid,
      );

      if (file) {
        article.coverImage = file;
      }
    }

    const saved = await this.articleRepository.save(article);
    return this.toDto(saved);
  }

  async updateArticle(
    id: Uuid,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleDto> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['coverImage'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (updateArticleDto.title !== undefined) {
      article.title = updateArticleDto.title;
    }

    if (updateArticleDto.excerpt !== undefined) {
      article.excerpt = updateArticleDto.excerpt;
    }

    if (updateArticleDto.content !== undefined) {
      article.content = updateArticleDto.content;
    }

    if (updateArticleDto.category !== undefined) {
      article.category = updateArticleDto.category;
    }

    if (updateArticleDto.coverImageId !== undefined) {
      if (updateArticleDto.coverImageId === null) {
        article.coverImage = null;
      } else {
        const file = await this.filesService.findOneById(
          updateArticleDto.coverImageId as Uuid,
        );

        if (file) {
          article.coverImage = file;
        }
      }
    }

    if (updateArticleDto.status !== undefined) {
      article.status = updateArticleDto.status;

      if (updateArticleDto.status === 'PUBLIE' && !article.publishedAt) {
        article.publishedAt = new Date();
      }
    }

    const saved = await this.articleRepository.save(article);
    return this.toDto(saved);
  }

  async getAdminArticles(
    pageOptionsDto: ArticlePageOptionsDto,
  ): Promise<PageDto<ArticleDto>> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.coverImage', 'coverImage');

    if (pageOptionsDto.category) {
      queryBuilder.andWhere('article.category = :category', {
        category: pageOptionsDto.category,
      });
    }

    queryBuilder
      .orderBy('article.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [items, itemCount] = await queryBuilder.getManyAndCount();
    const meta = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(items.map((item) => this.toDto(item)), meta);
  }

  async getAdminArticle(id: Uuid): Promise<ArticleDto> {
    const entity = await this.articleRepository.findOne({
      where: { id },
      relations: ['coverImage'],
    });
    console.log(entity);

    if (!entity) {
      throw new NotFoundException('Article not found');
    }

    return this.toDto(entity);
  }
}

