import {  Controller, Get, Param, ParseUUIDPipe, Patch, Post,Request } from "@nestjs/common";
import  { NotificationService } from "./notification.service";
import {  ApiBearerAuth,  ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { CurrentUser } from "../../decorators/user.dcorator";
import { Auth } from "../../decorators/http.decorators";

@Controller('notifications')
export class NotificationsController {

    constructor(private notificationsService: NotificationService){

    }






/**
 * Deactivate a mobile device (logout)
 */


@Auth()
@Get()
@ApiOperation({ summary: 'Get all notifications for the logged-in user' })
@ApiResponse({ status: 200, description: 'List of notifications returned successfully.' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiBearerAuth()
async getUserNotifications(
    @Request() req: any ,
    @CurrentUser() user: any,

) {
    console.log('req',req.user)
    console.log('notif',user)
  return this.notificationsService.getUserNotifications(user.id);
}

@Auth()
@Patch(':id/seen')
@ApiOperation({ summary: 'Mark a notification as seen' })
@ApiParam({ name: 'id', type: String, description: 'Notification ID' })
@ApiResponse({ status: 200, description: 'Notification marked as seen.' })
@ApiResponse({ status: 404, description: 'Notification not found.' })
@ApiBearerAuth()
async markAsSeen(    @Param('id', new ParseUUIDPipe()) notificationId: Uuid,@Request() req:any) {
  return this.notificationsService.markAsSeen(req.user.id,notificationId);
}



@Auth()
@Post('mark-all-read')
@ApiOperation({ summary: 'Mark a notification as seen' })
@ApiResponse({ status: 200, description: 'Notifications marked as seen.' })
@ApiBearerAuth()

async markAllAsSeen( @Request() req:any) {
  return this.notificationsService.markAllAsRead(req.user.id);
}





}