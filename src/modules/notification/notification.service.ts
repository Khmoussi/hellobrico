import { Injectable, NotFoundException } from "@nestjs/common";

import { RoleType } from "../../constants/role-type.ts";
import type { Notification } from "./entities/notification.entity";
import { NotificationTypeEnum } from "./enum/notification-type.enum";
import  { NotificationRepoitory } from "./repositories/notification.repository";
import  { UserNotificationRepository } from "./repositories/user-notification.repository";
import  { UserService } from "../user/user.service";
import  { EmailService } from "../mailer/services/email/email.service";
import { UserNotification } from "./entities/user-notification.entity";


@Injectable()
export class NotificationService {
    
    
   

    constructor(
        private readonly notificationRepo: NotificationRepoitory,
        private readonly userNotificationRepo: UserNotificationRepository,
        private readonly userService:UserService,
        private readonly emailService:EmailService
    ){

    }
     
    

   

        async notifyClient(
            _userId: string,
            notification: Notification,
        ) {
            const staffUsers = await this.userService.findUsersByRoles([
                RoleType.ADMIN,
                RoleType.SUPERVISOR,
                RoleType.COMMERCIAL,
            ]);
            if (staffUsers.length === 0) return;

            const userNotifications = staffUsers.map((user) =>
                this.userNotificationRepo.create({
                    user,
                    notification,
                    isSeen: false,
                }),
            );
            await this.userNotificationRepo.save(userNotifications);

            const contentHtml = `<p><strong>${notification.title}</strong></p><p>${notification.content}</p>`;
            await Promise.all(
                staffUsers
                    .filter((u) => u.email)
                    .map((user) =>
                        this.sendMail(
                            notification,
                            user.email!,
                            notification.content,
                            contentHtml,
                        ),
                    ),
            );
        }

        async notifyAdmins(notification: Notification) {
            const adminUsers = await this.userService.findUsersByRoles([
                RoleType.ADMIN,
            ]);
            if (adminUsers.length === 0) return;

            const userNotifications = adminUsers.map((user) =>
                this.userNotificationRepo.create({
                    user,
                    notification,
                    isSeen: false,
                }),
            );
            await this.userNotificationRepo.save(userNotifications);

            const contentHtml = `<p><strong>${notification.title}</strong></p><p>${notification.content}</p>`;
            await Promise.all(
                adminUsers
                    .filter((u) => u.email)
                    .map((user) =>
                        this.sendMail(
                            notification,
                            user.email!,
                            notification.content,
                            contentHtml,
                        ),
                    ),
            );
        }

       


        async getUserNotifications(userId: Uuid) {
            return this.userNotificationRepo.find({
            where: { user: { id: userId } },
            relations: ['notification'],
            order: { createdAt: 'DESC' },
            });
        }
      
  
        async markAsSeen(userId: Uuid, notificationId: Uuid) {
            const userNotification = await this.userNotificationRepo.findOne({
              where: { user: { id: userId }, notification: { id: notificationId } },
            });
        
            if (!userNotification) {
              throw new NotFoundException('Notification not found for this user');
            }
        
            userNotification.isSeen = true;
            return await  this.userNotificationRepo.save(userNotification);
          }


    
        async saveNotificationForUsers(
        title: string,
        content: string,
        type: NotificationTypeEnum,
        forumId:string,
        userIds: string[],
    ) {  
        // create notification
        const notification = this.notificationRepo.create({
        title,
        content,
        notificationType: type,
        forumId:forumId
        });
        await this.notificationRepo.save(notification);

        // fetch users
        const users = await this.userService.findUsersInIds(
       userIds
        );

        // create user-notification links
        const userNotifications = users.map((user) =>
        this.userNotificationRepo.create({
            user,
            notification,
            isSeen: false,
        }),
        );

        await this.userNotificationRepo.save(userNotifications);

          users.forEach((user) => this.notifyClient(user.id, notification));



        return notification;
        }
    
        async saveNotificationForUser(
            title: string,
            content: string,
            type: NotificationTypeEnum,
            userId:Uuid,
            reservationId?:string,
            forumId?:string
        ) {  
            // create notification
            const notification = this.notificationRepo.create({
            title,
            content,
            notificationType: type,
            reservationId,
            forumId
            });
            
    
            // fetch users
            const user = await this.userService.findOneById(
            userId
            );
    
            if(!user)      
              throw new NotFoundException("User Not Found ")

              const result=   this.userNotificationRepo.create({
                    user,
                    notification,
                    isSeen: false,
                })
              await this.userNotificationRepo.save(result);

            
            
    
    console.log('saved notification :',notification)
            return notification;
            }

        async createNotification(
            title: string,
            content: string,
            type: NotificationTypeEnum,
            forumId?: string | null,
            reservationId?: string | null,
        ): Promise<Notification> {
            const notification = this.notificationRepo.create({
                title,
                content,
                notificationType: type,
                forumId: forumId ?? undefined,
                reservationId: reservationId ?? undefined,
            });
            await this.notificationRepo.save(notification);
            return notification;
        }

        async sendMail(notif:Notification,receiverMail:string,_contentText:string,contentHtml:string){
            this.emailService.sendUserEmail(
            receiverMail,
            notif.title,
            contentHtml
            );

        }
        async markAllAsRead(userId: string) {
            await this.userNotificationRepo
              .createQueryBuilder()
              .update(UserNotification)
              .set({ isSeen: true })
              .where("user.id = :userId", { userId }) // note the relation path
              .execute();
        
            return { message: 'All notifications marked as read' };
          }


      
}