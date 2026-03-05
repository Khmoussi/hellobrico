import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AddLeadNoteDto {
  @ApiProperty({
    example: 'Client rappelé, visite programmée jeudi 14h.',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  note!: string;
}
