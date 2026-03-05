import { IsNumber, IsString } from 'class-validator';

export class UploadFileMulterDto {
  @IsString()
  fieldname!: string;

  @IsString()
  originalname!: string;

  @IsString()
  encoding!: string;

  @IsString()
  mimetype!: string;

  @IsString()
  destination?: string;

  @IsString()
  filename?: string;

  @IsString()
  path?: string;

  @IsNumber()
  size!: number;

  buffer!: Buffer|null;
  
  @IsString()
  public_url?: string;
}
