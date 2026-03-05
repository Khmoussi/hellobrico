
import {
    Column,
    Entity,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Notification } from './notification.entity';
import { UserEntity } from '../../../modules/user/user.entity';

@Entity()
export class UserNotification {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.notifications, {
        onDelete: 'SET NULL',
        nullable: true,
      })
    user!: UserEntity ;

    @ManyToOne(
         'Notification',
        (notitification:Notification) => notitification.userNotifications,
        { cascade: true, eager: true } // 👈 cascade added

    )
    notification!: Notification ;

    @Column({ default: false })
    isSeen: boolean=false;

    @CreateDateColumn()
    createdAt!: Date;
    @UpdateDateColumn()
    updatedAt!: Date;
    
}
