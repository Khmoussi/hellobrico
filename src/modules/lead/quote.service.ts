import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { EmailService } from '../mailer/services/email/email.service.ts';
import { FilesService } from '../files/files.service.ts';
import type { UserEntity } from '../user/user.entity.ts';
import { LeadEntity } from './entities/lead.entity.ts';
import { Quote } from './entities/quote.entity.ts';
import type { UploadFileMulterDto } from '../files/dto/upload-file-multer.dto.ts';

const QUOTE_EMAIL_SUBJECT = 'Votre estimation HelloBrico';

function quoteEmailBody(fullName: string): string {
  return `Bonjour ${fullName},

Veuillez trouver ci-joint votre devis détaillé.

Nous restons disponibles pour toute clarification.

Cordialement,
HelloBrico`;
}

@Injectable()
export class QuoteService {
  constructor(
    @InjectRepository(LeadEntity)
    private leadRepository: Repository<LeadEntity>,
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
    private filesService: FilesService,
    private emailService: EmailService,
  ) {}

  async sendQuoteForLead(
    leadId: Uuid,
    file: UploadFileMulterDto,
    sentBy: UserEntity,
  ): Promise<Quote> {
    const lead = await this.leadRepository.findOne({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const attachmentBuffer =
      file.buffer && file.buffer.length > 0
        ? Buffer.from(file.buffer)
        : undefined;

    const uploadedFile = await this.filesService.uploadFile(file);

    const emailTo = lead.email;
    const emailSubject = QUOTE_EMAIL_SUBJECT;
    const emailBody = quoteEmailBody(lead.fullName);
    const htmlContent = emailBody.replace(/\n/g, '<br>');

    if (attachmentBuffer && file.originalname) {
      await this.emailService.sendEmailWithAttachment(
        emailTo,
        emailSubject,
        htmlContent,
        {
          filename: file.originalname,
          content: attachmentBuffer,
          contentType: file.mimetype ?? 'application/pdf',
        },
      );
    } else {
      await this.emailService.sendUserEmail(
        emailTo,
        emailSubject,
        htmlContent,
      );
    }

    const sentAt = new Date();
    const quote = this.quoteRepository.create({
      lead,
      file: uploadedFile,
      sentBy,
      sentAt,
      emailTo,
      emailSubject,
      emailBody,
    });
    await this.quoteRepository.save(quote);
    const withRelations = await this.quoteRepository.findOne({
      where: { id: quote.id },
      relations: ['file', 'sentBy'],
    });
    return withRelations!;
  }

  async getQuotesForLead(leadId: Uuid): Promise<Quote[]> {
    const lead = await this.leadRepository.findOne({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.quoteRepository.find({
      where: { lead: { id: leadId } },
      relations: ['file', 'sentBy'],
      order: { sentAt: 'DESC' },
    });
  }
}
