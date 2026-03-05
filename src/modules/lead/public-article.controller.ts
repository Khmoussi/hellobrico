import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../common/dto/page.dto.ts';
import { PublicRoute } from '../../decorators/public-route.decorator.ts';
import { ArticleService } from './article.service.ts';
import { ArticleDto } from './dtos/article.dto.ts';
import { ArticlePageOptionsDto } from './dtos/article-page-options.dto.ts';

@Controller('articles')
@ApiTags('articles')
export class PublicArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @PublicRoute(true)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: PageDto,
    description: 'List of published articles',
  })
  async getArticles(
    @Query() pageOptionsDto: ArticlePageOptionsDto,
  ): Promise<PageDto<ArticleDto>> {
    return this.articleService.getPublishedArticles(pageOptionsDto);
  }

  @Get(':id')
  @PublicRoute(true)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ArticleDto, description: 'Article by id' })
  async getById(@Param('id') id: string): Promise<ArticleDto> {
    return this.articleService.getPublishedById(id as Uuid);
  }
}

