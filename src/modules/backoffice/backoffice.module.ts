import { Module } from '@nestjs/common';

import { LeadModule } from '../lead/lead.module.ts';
import { UserModule } from '../user/user.module.ts';
import { AdminArticleController } from './controllers/admin-article.controller.ts';
import { AdminDashboardController } from './controllers/admin-dashboard.controller.ts';
import { AdminLeadController } from './controllers/admin-lead.controller.ts';
import { AdminProjectController } from './controllers/admin-project.controller.ts';
import { AdminQuoteController } from './controllers/admin-quote.controller.ts';
import { AdminUserController } from './controllers/admin-user.controller.ts';

@Module({
  imports: [LeadModule, UserModule],
  controllers: [
    AdminDashboardController,
    AdminLeadController,
    AdminArticleController,
    AdminUserController,
    AdminQuoteController,
    AdminProjectController,
  ],
})
export class BackofficeModule {}

