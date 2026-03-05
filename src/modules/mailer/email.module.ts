import { Module } from '@nestjs/common';
import { EmailService } from './services/email/email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailController } from './controllers/email/email.controller';



@Module({
    imports: [
      MailerModule.forRoot({
        transport: {
          host: 'smtp.gmail.com', // e.g., smtp.gmail.com
          port: 587,
          secure: false, // true for 465
          auth: {
            user: 'khmoussiaouina@gmail.com',
            pass: 'tjls xjyd hntw nbzo',
          },
        },
        defaults: {
          from: '"HelloBrico " <noreply@example.com>',
        },
       
      }),
    ],
    providers: [EmailService],
    exports: [EmailService],
    controllers: [EmailController],
  })
  export class EmailModule {}