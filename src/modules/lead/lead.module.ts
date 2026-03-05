import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../mailer/email.module.ts';
import { File } from '../files/entities/file.entity.ts';
import { FilesModule } from '../files/files.module.ts';
import { UserEntity } from '../user/user.entity.ts';
import { ArticleEntity } from './entities/article.entity.ts';
import { LeadEntity, LeadHistoryEntity } from './entities/lead.entity.ts';
import { Quote } from './entities/quote.entity.ts';
import { ArticleService } from './article.service.ts';
import { LeadController } from './lead.controller.ts';
import { LeadService } from './lead.service.ts';
import { PublicArticleController } from './public-article.controller.ts';
import { QuoteService } from './quote.service.ts';
import { ArticleRepository } from './repositories/article.repository.ts';
import { TypeOrmExModule } from '../../database/typeorm-ex.module.ts';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeadEntity,
      LeadHistoryEntity,
      ArticleEntity,
      Quote,
      File,
      UserEntity,
    ]),
    TypeOrmExModule.forCustomRepository([ArticleRepository]),
    FilesModule,
    EmailModule,
  ],
  controllers: [LeadController, PublicArticleController],
  providers: [LeadService, ArticleService, QuoteService],
  exports: [LeadService, ArticleService, QuoteService],
})
export class LeadModule {}

