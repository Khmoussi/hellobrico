import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AddProjectNoteDto {
  @ApiProperty({
    example: 'Visite technique prévue mardi 10h.',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  note!: string;
}
