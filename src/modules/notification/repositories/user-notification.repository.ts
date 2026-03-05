import { Repository } from 'typeorm';
import { UserNotification } from '../entities/user-notification.entity';
import { CustomRepository } from '../../../database/typeorm-ex.decorator';

@CustomRepository(UserNotification)
export class UserNotificationRepository extends Repository<UserNotification> {
    
    async findUserNotifications(usersId: string, limit: number) {
        return this.createQueryBuilder('notifications')
            .leftJoinAndSelect('notifications.notification', 'notification')
            .leftJoinAndSelect('notification.order', 'order')
            .leftJoinAndSelect('notification.item', 'item')
            .leftJoinAndSelect('notification.laundry', 'laundry')
            .leftJoinAndSelect('notification.payout', 'payout')
            .leftJoinAndSelect('notification.laundryIncome', 'laundryIncome')
            .leftJoinAndSelect('notification.customOrder', 'customOrder')
            .leftJoin('notifications.user', 'user')
            .where('user.id = :usersId', { usersId })
            .orderBy('notifications.createdAt', 'DESC')
            .limit(limit)
            .getMany();
    }
}
