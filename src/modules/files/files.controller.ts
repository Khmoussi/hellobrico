import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {  ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { UploadFileMulterDto } from './dto/upload-file-multer.dto';

import type { UserEntity } from '../../modules/user/user.entity';
import { UploadFileDto } from './dto/upload-file.dto';
import multer from 'multer';
import { UploadFilesDto } from './dto/upload-files.dto';
import { CurrentUser } from '../../decorators/user.dcorator';
// const multerConfig = {
//     storage: multer.diskStorage({
//       destination: './uploads',
//       filename(_req, file, cb) {
//         const ext = file.originalname.split('.').pop();
//         const generatedName = `file-${Date.now()}.${ext}`;
//         console.log('Generating filename:', generatedName);
      
//         // Attach extension to the file object for access later
//         (file as any).extension = ext;
      
//         cb(null, generatedName);
//       },
//     }),
//   };

const multerConfig = {
    storage: multer.memoryStorage(), // store file in memory
    limits: { fileSize: 10 * 1024 * 1024 }, // optional: max 10MB
  };
  
@ApiTags('File')
@Controller('files')
export class FilesController {
    
  constructor(private fileService: FilesService
  ) {
      
  }

  @Post('/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto }) 

  @UseInterceptors(FileInterceptor('file',multerConfig))
  async uploadFile(
   // @Body() uploadFileDto: UploadFileDto,
    @UploadedFile() file: UploadFileMulterDto,
  ) {
    console.log(file)
    console.log(file.buffer!.length)

    
    return  this.fileService.uploadFile(file);
    

  }

  @Post('/upload-multiple')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFilesDto }) 

  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @CurrentUser() _user: UserEntity,
    @UploadedFiles() files: UploadFileMulterDto[],
  ) {
    return this.fileService.uploadFiles(files);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
      return this.fileService.remove(id);
  }


  @Get('find-by-ids')
  @ApiOperation({ summary: 'Get multiple files by their IDs' })
  @ApiQuery({ name: 'ids', description: 'Comma-separated list of file IDs', required: true })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully', type: [File] })
  @ApiResponse({ status: 404, description: 'No files found for the given IDs' })
  async findFilesByIds(@Query('ids') ids: string) {
    if (!ids) {
      return [];
    }
    // Split comma-separated string into array
    const idArray = ids.split(',').map((id) => id.trim());
    const files = await this.fileService.findAllByIds(idArray);

    if (!files || files.length === 0) {
      // Optionally throw 404 if nothing is found
      // throw new NotFoundException('No files found for the given IDs');
      return [];
    }

    return files;
  }
}
