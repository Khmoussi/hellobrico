import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../mailer/email.module.ts';
import { File } from '../files/entities/file.entity.ts';
import { FilesModule } from '../files/files.module.ts';
import { UserEntity } from '../user/user.entity.ts';
import { ArticleEntity } from './entities/article.entity.ts';
import { LeadEntity, LeadHistoryEntity } from './entities/lead.entity.ts';
import { PartnerEntity } from './entities/partner.entity.ts';
import { ProjectEntity } from './entities/project.entity.ts';
import { ProjectNoteEntity } from './entities/project-note.entity.ts';
import { Quote } from './entities/quote.entity.ts';
import { ArticleService } from './article.service.ts';
import { LeadController } from './lead.controller.ts';
import { LeadService } from './lead.service.ts';
import { PartnerController } from './partner.controller.ts';
import { PartnerService } from './partner.service.ts';
import { ProjectService } from './project.service.ts';
import { PublicArticleController } from './public-article.controller.ts';
import { QuoteService } from './quote.service.ts';
import { ArticleRepository } from './repositories/article.repository.ts';
import { TypeOrmExModule } from '../../database/typeorm-ex.module.ts';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeadEntity,
      LeadHistoryEntity,
      PartnerEntity,
      ArticleEntity,
      Quote,
      ProjectEntity,
      ProjectNoteEntity,
      File,
      UserEntity,
    ]),
    TypeOrmExModule.forCustomRepository([ArticleRepository]),
    FilesModule,
    EmailModule,
  ],
  controllers: [LeadController, PartnerController, PublicArticleController],
  providers: [LeadService, PartnerService, ArticleService, QuoteService, ProjectService],
  exports: [LeadService, PartnerService, ArticleService, QuoteService, ProjectService],
})
export class LeadModule {}

