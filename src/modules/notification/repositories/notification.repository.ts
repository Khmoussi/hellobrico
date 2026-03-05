import { Repository } from 'typeorm';
import { CustomRepository } from '../../../database/typeorm-ex.decorator';
import { Notification } from '../entities/notification.entity';


@CustomRepository(Notification)
export class NotificationRepoitory extends Repository<Notification> {

}
