// dto/send-test-email.dto.ts
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendTestEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Recipient email address',
  })
  @IsEmail()
  @IsNotEmpty()
  to!: string;

  @ApiProperty({
    example: 'Test Subject',
    description: 'Email subject',
  })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({
    example: '<h1>Hello from NestJS!</h1>',
    description: 'HTML content of the email',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}