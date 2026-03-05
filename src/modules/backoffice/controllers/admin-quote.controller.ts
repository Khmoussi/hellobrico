import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import multer from 'multer';

import { RoleType } from '../../../constants/role-type.ts';
import { Auth, UUIDParam } from '../../../decorators/http.decorators.ts';
import { CurrentUser } from '../../../decorators/user.dcorator.ts';
import type { UploadFileMulterDto } from '../../files/dto/upload-file-multer.dto.ts';
import { QuoteDto } from '../../lead/dtos/quote.dto.ts';
import { QuoteService } from '../../lead/quote.service.ts';
import type { UserEntity } from '../../user/user.entity.ts';

const multerConfig = {
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
};

@Controller('admin/leads/:leadId/quotes')
@ApiTags('admin-quotes')
export class AdminQuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @Auth([RoleType.ADMIN, RoleType.SUPERVISOR, RoleType.COMMERCIAL])
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiParam({ name: 'leadId', type: 'string', format: 'uuid', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiCreatedResponse({ type: QuoteDto, description: 'Quote uploaded and sent by email' })
  async uploadAndSendQuote(
    @UUIDParam('leadId') leadId: Uuid,
    @CurrentUser() user: UserEntity,
    @UploadedFile() file: UploadFileMulterDto,
  ): Promise<QuoteDto> {
    const quote = await this.quoteService.sendQuoteForLead(leadId, file, user);
    return new QuoteDto(quote);
  }

  @Get()
  @Auth([RoleType.ADMIN, RoleType.SUPERVISOR, RoleType.COMMERCIAL])
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'leadId', type: 'string', format: 'uuid', required: true })
  @ApiOkResponse({ type: [QuoteDto], description: 'All quotes for the lead' })
  async getQuotesForLead(
    @UUIDParam('leadId') leadId: Uuid,
  ): Promise<QuoteDto[]> {
    const quotes = await this.quoteService.getQuotesForLead(leadId);
    return quotes.map((q) => new QuoteDto(q));
  }
}
