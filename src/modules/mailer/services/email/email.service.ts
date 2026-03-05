// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserEmail(to: string, subject: string, content: string) {
    return this.mailerService.sendMail({
      to,
      subject,
      text: content, // plain text fallback
      html: `<p>${content}</p>`, // HTML content
    });
  }

  async sendTemplateEmail(to: string, subject: string, context: any) {
    return this.mailerService.sendMail({
      to,
      subject,
      template: 'welcome', // Name of your template in `templates` folder
      context, // variables for the template
    });
  }

  async sendEmailWithAttachment(
    to: string,
    subject: string,
    htmlContent: string,
    attachment: { filename: string; content: Buffer; contentType: string },
  ) {
    return this.mailerService.sendMail({
      to,
      subject,
      html: htmlContent,
      text: htmlContent.replace(/<[^>]*>/g, ''),
      attachments: [
        {
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        },
      ],
    });
  }
}
