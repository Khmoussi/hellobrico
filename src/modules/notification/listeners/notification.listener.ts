import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { NotificationService } from '../notification.service';
import { NotificationTypeEnum } from '../enum/notification-type.enum';
import type { LeadEntity } from '../../lead/entities/lead.entity.ts';
import type { PartnerEntity } from '../../lead/entities/partner.entity.ts';

@Injectable()
export class NotificationListener {
  constructor(private readonly notificationService: NotificationService) {}




  // reservation notifications



//   @OnEvent('reservation.accepted', { async: true }) // 🚀 handled async
//   async handleReservationAccepted
//   (payload: { reservartion: Reservation }) {
//     console.log("reservation accept event")

//     const reservation = payload.reservartion;
// // حفظ + إرسال الإشعارات
// const notif=await this.notificationService.saveNotificationForUser( 
//     `الكتاب "${reservation.book.name}"`,
//     "تم قبول طلب الحجز بنجاح",
//     NotificationTypeEnum.RESERVATION,
//     reservation.book.postedBy.id,
//     reservation.id,
//     undefined
//   );

//   this.notificationService.notifyClient(reservation.book.postedBy.id,notif)
  
//  const notif2= await this.notificationService.saveNotificationForUser( 
//     `الكتاب "${reservation.book.name}"`,
//     `تم قبول طلبك لحجز الكتاب "${reservation.book.name}"`,
//     NotificationTypeEnum.RESERVATION,
//     reservation.student.id,
//     reservation.id,
//     undefined
//   );
//   this.notificationService.notifyClient(reservation.student.id,notif2)

    
//   }

//   @OnEvent('reservation.rejected', { async: true }) // 🚀 handled async
//   async handleReservationRejected
//   (payload: { reservartion: Reservation }) {
//     console.log("reservation reject event")

//     const reservation = payload.reservartion;

//     // Save + send notifications
//    const notif= await this.notificationService.saveNotificationForUser( 
//         `الكتاب "${reservation.book.name}"`,
//         "تم رفض طلب الحجز بنجاح",
//         NotificationTypeEnum.RESERVATION,
//         reservation.book.postedBy.id,
//         reservation.id,
//         undefined
//       );
//       this.notificationService.notifyClient(reservation.book.postedBy.id,notif)

      
//     const notif2=  await this.notificationService.saveNotificationForUser( 
//         `الكتاب "${reservation.book.name}"`,
//         `تم رفض طلبك لحجز الكتاب "${reservation.book.name}"`,
//         NotificationTypeEnum.RESERVATION,
//         reservation.student.id,
//         reservation.id,
//         undefined
//        );

//        this.notificationService.notifyClient(reservation.student.id,notif2)

//   }

//   @OnEvent('reservation.reserved', { async: true }) // 🚀 handled async
//   async handleReservationPaied
//   (payload: { reservartion: Reservation }) {
//     console.log("reservation reserved event")

//     const reservation = payload.reservartion;

//    // حفظ + إرسال الإشعارات
// const notif=await this.notificationService.saveNotificationForUser( 
//     'تم دفع الحجز',
//     `الكتاب "${reservation.book.name}"`,
//     NotificationTypeEnum.RESERVATION,
//     reservation.book.postedBy.id,
//     reservation.id,
//     undefined
//   );
//   this.notificationService.notifyClient(reservation.book.postedBy.id,notif)

//  const notif2= await this.notificationService.saveNotificationForUser( 
//     'تم دفع الحجز',
//     `الكتاب "${reservation.book.name}"`,
//     NotificationTypeEnum.RESERVATION,
//     reservation.student.id,
//     reservation.id,
//     undefined
//   );
//   this.notificationService.notifyClient(reservation.student.id,notif2)

  
//   }


//   @OnEvent('reservation.validated', { async: true }) // 🚀 handled async
//   async handleReservationValidated
//   (payload: { reservartion: Reservation }) {
//     console.log("reservation validated event")

//     const reservation = payload.reservartion;

//     // Save + send notifications
//    const notif= await this.notificationService.saveNotificationForUser( 
//         `الكتاب "${reservation.book.name}"`,
//         'تم اعتماد الحجز بنجاح',
//         NotificationTypeEnum.RESERVATION,
//         reservation.book.postedBy.id,
//         reservation.id,
//         undefined
//     );
//     this.notificationService.notifyClient(reservation.book.postedBy.id,notif)

//     const notif2=  await this.notificationService.saveNotificationForUser( 
//         `الكتاب "${reservation.book.name}"`,
//         'تم اعتماد الحجز بنجاح من قبل المالك',
//         NotificationTypeEnum.RESERVATION,
//         reservation.student.id,
//         reservation.id,
//         undefined
//       );
//       this.notificationService.notifyClient(reservation.student.id,notif2)

//   }

//   @OnEvent('reservation.inValidated', { async: true }) // 🚀 handled async
//   async handleReservationInValidated
//   (payload: { reservartion: Reservation }) {
//     console.log("reservation invalidated event")

//     const reservation = payload.reservartion;

//     // Save + send notifications
//  const notif=await this.notificationService.saveNotificationForUser( 
//   `الكتاب "${reservation.book.name}"`,
//   'تم رفض الحجز بنجاح',
//   NotificationTypeEnum.RESERVATION,
//   reservation.book.postedBy.id,
//   reservation.id,
//   undefined
// );
// this.notificationService.notifyClient(reservation.book.postedBy.id,notif)

// const notif2=await this.notificationService.saveNotificationForUser( 
//   `الكتاب "${reservation.book.name}"`,
//   'تم رفض الحجز من قبل المالك',
//   NotificationTypeEnum.RESERVATION,
//   reservation.student.id,
//   reservation.id,
//   undefined
// );
// this.notificationService.notifyClient(reservation.student.id,notif2)

//   }



//   // messaging events


//   //email commission events
//   @OnEvent('commission.received', { async: true })
//   async handleCommissionReceived(payload: { commission: Commission }) {
//     console.log('commission received event');
  
//     const commission = payload.commission;
//     const user = commission.user; // لأنك عاملت relation للـ user
//     const admin = await this.userService.getSuperAdmin();
  
//     if (!admin) return;
  
//     // تنسيق التاريخ بالعربي بشكل جميل
//     const formattedDate = new Date(commission.createdAt!).toLocaleString('ar-SA', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
  
//     const commissionIdShort = commission.id.slice(0, 8).toUpperCase();
//   //  const adminDashboardLink = `${process.env.ADMIN_URL}/commissions/${commission.id}`;
// //   رابط الطلب في لوحة التحكم:
// //   ${adminDashboardLink}
// //        <a href="${adminDashboardLink}" class="btn" target="_blank">فتح الطلب في لوحة التحكم</a>
// //          <tr><td class="label">قيمة العمولة</td><td class="value amount">${commission.amount?.toLocaleString()} ر.س</td></tr>

  
//     const proofLink = commission.proofImageUrl
//       ? commission.proofImageUrl
//       : null;
  
//     // Plain Text Version (للي ما بيدعم HTML)
//     const textVersion = `
//   طلب صرف عمولة جديد ينتظر المراجعة
  
//   رقم الطلب: #COM-${commissionIdShort}
//   تاريخ التقديم: ${formattedDate}
  
//   بيانات المستخدم:
//   • الاسم: ${user.fullname || 'غير محدد'}
//   • الجوال: ${user.phone}
//   • الإيميل: ${user.email}
//   • المعرف: ${user.id}
  
//   تفاصيل الطلب:
//   • المبلغ: ${commission.amount?.toLocaleString()} ريال سعودي
//   • الحالة: قيد الانتظار
//   • إثبات الدفع: ${proofLink || 'غير مرفوع'}
  
  
//   يرجى المراجعة خلال 24-48 ساعة.
//   شكراً لكم،
//   النظام الآلي - الكتاب الجامعي
//   `.trim();
  
//     // HTML Version (جميلة ومتجاوبة وتعمل في كل الإيميلات)
//     const htmlVersion = `
//   <!DOCTYPE html>
//   <html dir="rtl" lang="ar">
//   <head>
//     <meta charset="UTF-8">
//     <style>
//       body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background:#f9fafb; margin:0; padding:20px; }
//       .container { max-width: 620px; margin: 0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.08); }
//       .header { background:#1d4ed8; color:#fff; padding:24px; text-align:center; font-size:24px; font-weight:bold; }
//       .body { padding:32px; line-height:1.8; color:#1f2937; }
//       table { width:100%; border-collapse:collapse; margin:20px 0; }
//       td { padding:12px 0; border-bottom:1px solid #e5e7eb; }
//       .label { font-weight:bold; color:#1d4ed8; width:38%; }
//       .value { color:#111827; }
//       .amount { font-size:28px; font-weight:bold; color:#166534; }
//       .status { background:#fef3c7; color:#92400e; padding:6px 16px; border-radius:50px; font-weight:bold; font-size:14px; }
//       .btn { display:block; width:fit-content; margin:30px auto 0; padding:14px 36px; background:#1d4ed8; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px; }
//       .footer { background:#f1f5f9; padding:20px; text-align:center; color:#64748b; font-size:13px; }
//       .proof { color:#1d4ed8; font-weight:bold; }
//     </style>
//   </head>
//   <body>
//     <div class="container">
//       <div class="header">طلب صرف عمولة جديد</div>
//       <div class="body">
//         <p>تم استلام طلب صرف عمولة جديد يحتاج إلى مراجعتكم.</p>
  
//         <table>
//           <tr><td class="label">رقم الطلب</td><td class="value">#COM-${commissionIdShort}</td></tr>
//           <tr><td class="label">تاريخ التقديم</td><td class="value">${formattedDate}</td></tr>
//           <tr><td class="label">اسم المستخدم</td><td class="value">${user.fullname || 'غير محدد'}</td></tr>
//           <tr><td class="label">رقم الجوال</td><td class="value">${user.phone}</td></tr>
//           <tr><td class="label">الحالة</td><td class="value"><span class="status">قيد الانتظار</span></td></tr>
//           <tr>
//             <td class="label">إثبات الدفع</td>
//             <td class="value">
//               ${proofLink 
//                 ? `<a href="${proofLink}" target="_blank" class="proof">عرض الصورة</a>` 
//                 : 'غير مرفوع'}
//             </td>
//           </tr>
//         </table>
  
//       </div>
//       <div class="footer">
//         إشعار تلقائي من نظام الكتاب الجامعي • لا ترد على هذا البريد
//       </div>
//     </div>
//   </body>
//   </html>
//     `.trim();
  
//     // حفظ الإشعار في قاعدة البيانات
//     const notif = await this.notificationService.saveNotificationForUser(
//       `عمولة جديدة • ${commissionIdShort.toLocaleString()}.`,
//       'تم استلام طلب صرف عمولة جديد',
//       NotificationTypeEnum.COMMISSION,
//       admin.id,
//       undefined,
//       undefined
//     );
  
//     // إرسال الإيميل (مع text + html)
//     if (admin.email) {
//       await this.notificationService.sendMail(
//         notif,
//         admin.email,
//         textVersion,   // text fallback
//         htmlVersion    // النسخة الجميلة
//       );
//     }
//   }

  @OnEvent('lead.created', { async: true })
  async handleLeadCreated(payload: { lead: LeadEntity }) {
    const lead = payload.lead;
    const title = 'Nouvelle demande de devis';
    const content = `${lead.fullName} (${lead.email}) — ${lead.projectAddress}${lead.city ? `, ${lead.city}` : ''}. ${lead.description ?? ''}`.trim();
    const notification = await this.notificationService.createNotification(
      title,
      content,
      NotificationTypeEnum.LEAD,
      undefined,
      undefined,
    );
    await this.notificationService.notifyClient(lead.id, notification);
  }

  @OnEvent('partner.created', { async: true })
  async handlePartnerCreated(payload: { partner: PartnerEntity }) {
    const partner = payload.partner;
    const title = 'Nouvelle demande de partenariat';
    const content = `${partner.companyName} — ${partner.fullName} (${partner.email}). ${partner.partnershipType}${partner.cityCountry ? ` • ${partner.cityCountry}` : ''}. ${partner.description ?? ''}`.trim();
    const notification = await this.notificationService.createNotification(
      title,
      content,
      NotificationTypeEnum.PARTNER,
      undefined,
      undefined,
    );
    await this.notificationService.notifyAdmins(notification);
  }
}
