import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto.ts';
import { RoleType } from '../../../constants/role-type.ts';
import { Auth, UUIDParam } from '../../../decorators/http.decorators.ts';
import { CurrentUser } from '../../../decorators/user.dcorator.ts';
import { ArticleService } from '../../lead/article.service.ts';
import { ArticleDto } from '../../lead/dtos/article.dto.ts';
import { ArticlePageOptionsDto } from '../../lead/dtos/article-page-options.dto.ts';
import {
  CreateArticleDto,
  UpdateArticleDto,
} from '../../lead/dtos/create-article.dto.ts';
import type { UserEntity } from '../../user/user.entity.ts';

@Controller('admin/articles')
@ApiTags('admin-articles')
export class AdminArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: PageDto,
    description: 'Paginated list of articles for admin',
  })
  async getArticles(
    @Query() pageOptionsDto: ArticlePageOptionsDto,
  ): Promise<PageDto<ArticleDto>> {
    return this.articleService.getAdminArticles(pageOptionsDto);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ArticleDto, description: 'Article by id' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    required: true,
    description: 'Article ID',
  })
  async getArticle(@UUIDParam('id') id: Uuid): Promise<ArticleDto> {
    return this.articleService.getAdminArticle(id);
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: ArticleDto, description: 'Article created' })
  @ApiBody({
    type: CreateArticleDto,
    examples: {
      default: {
        summary: 'Example article payload',
        value: {
          title: 'Comment structurer une rénovation complète sans dépassement',
          excerpt:
            'Une rénovation réussie commence par un devis structuré et une planification claire.',
          content:
            'Contenu long de l’article en HTML ou Markdown, avec sections H2/H3…',
          category: 'BUDGET_PLANIFICATION',
          coverImageId: 'c4b8e0b8-1234-4d5e-9abc-1234567890ab',
        },
      },
    },
  })
  async createArticle(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: UserEntity,
  ): Promise<ArticleDto> {
    return this.articleService.createArticle(createArticleDto, user);
  }

  @Patch(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ArticleDto, description: 'Article updated' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    required: true,
    description: 'Article ID',
  })
  @ApiBody({
    type: UpdateArticleDto,
    examples: {
      default: {
        summary: 'Example update payload',
        value: {
          title: 'Titre mis à jour de l’article',
          excerpt:
            'Résumé mis à jour, toujours centré sur la méthode et la transparence.',
          content:
            'Contenu mis à jour de l’article en HTML ou Markdown, avec nouvelles sections…',
          category: 'CONSEILS_TECHNIQUES',
          coverImageId: 'd7a9e1f2-5678-4bcd-9abc-0987654321ff',
          status: 'PUBLIE',
        },
      },
    },
  })
  async updateArticle(
    @UUIDParam('id') id: Uuid,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleDto> {
    return this.articleService.updateArticle(id, updateArticleDto);
  }
}

