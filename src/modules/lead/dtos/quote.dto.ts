import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import type { Quote } from '../entities/quote.entity.ts';
import type { File } from '../../files/entities/file.entity.ts';
import type { UserEntity } from '../../user/user.entity.ts';

export class QuoteFileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  filename!: string;

  @ApiProperty()
  publicUrl!: string;

  @ApiProperty()
  mimetype!: string;

  constructor(file: File) {
    this.id = file.id;
    this.filename = file.filename;
    this.publicUrl = file.public_url;
    this.mimetype = file.mimetype;
  }
}

export class QuoteSentByDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  firstName?: string | null;

  @ApiPropertyOptional()
  lastName?: string | null;

  @ApiPropertyOptional()
  email?: string | null;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
  }
}

export class QuoteDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sentAt!: Date;

  @ApiProperty()
  emailTo!: string;

  @ApiProperty()
  emailSubject!: string;

  @ApiProperty()
  emailBody!: string;

  @ApiProperty({ type: QuoteFileDto })
  file!: QuoteFileDto;

  @ApiProperty({ type: QuoteSentByDto })
  sentBy!: QuoteSentByDto;

  constructor(quote: Quote) {
    this.id = quote.id;
    this.sentAt = quote.sentAt;
    this.emailTo = quote.emailTo;
    this.emailSubject = quote.emailSubject;
    this.emailBody = quote.emailBody;
    this.file = new QuoteFileDto(quote.file);
    this.sentBy = new QuoteSentByDto(quote.sentBy);
  }
}
