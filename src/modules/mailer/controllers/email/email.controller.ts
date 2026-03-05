import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import  { EmailService } from '../../../../modules/mailer/services/email/email.service';
import  { SendTestEmailDto } from '../../../../modules/mailer/dto/send-test-email.dto';

@ApiTags('Email')
@Controller('email')
export class EmailController {
    constructor(private emailService:EmailService){}
    
    @Post('send')
    @ApiOperation({ summary: 'Test Emailer – Send a test email' })
    @ApiResponse({ status: 200, description: 'Email sent successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 500, description: 'Failed to send email' })
    async sendTestEmail(@Body() dto: SendTestEmailDto) {
      const { to, subject, content } = dto;
  
      try {
        await this.emailService.sendUserEmail(to, subject, content);
        return { message: 'Email sent successfully!' };
      } catch (error: any) {
        return { message: 'Failed to send email', error: error.message };
      }
    }
  
}
