import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmExModule } from '../../database/typeorm-ex.module';
import { NotificationsController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepoitory } from './repositories/notification.repository';
import { UserNotification } from './entities/user-notification.entity';
import { UserNotificationRepository } from './repositories/user-notification.repository';
import { Notification } from './entities/notification.entity';
import { UserModule } from '../../modules/user/user.module';
import { NotificationListener } from './listeners/notification.listener';
import { EmailModule } from '../../modules/mailer/email.module';

@Module({
    imports: [EmailModule,UserModule,
      TypeOrmModule.forFeature([Notification,UserNotification])
  ,
  TypeOrmExModule.forCustomRepository([NotificationRepoitory, UserNotificationRepository])],
    controllers: [NotificationsController],
    exports: [NotificationService ], // Add these exports
    providers: [NotificationService,NotificationListener],
    
  })
export class NotificationModule {}
