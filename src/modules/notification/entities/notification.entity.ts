import {  Entity, PrimaryGeneratedColumn, Column,  CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";

import { NotificationTypeEnum } from "../enum/notification-type.enum";
import { UserNotification } from "./user-notification.entity";


@Entity()
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column()
    content!: string;

    @Column({
        type: 'enum',
        enum: NotificationTypeEnum,
    })
    notificationType!: NotificationTypeEnum;

    @CreateDateColumn()
    createdAt!: Date;
    
    @UpdateDateColumn()
    updatedAt!: Date;
    

    @Column({nullable:true})
    reservationId?:string;
    
    @Column({nullable:true})
    forumId?:string;

    @OneToMany(('UserNotification'), (userNotification:UserNotification) => userNotification.notification)
    userNotifications?: UserNotification[];

    // @OneToMany(() => AdminNotification, (adminNotification) => adminNotification.notification)
    // adminNotifications: AdminNotification[];


}
