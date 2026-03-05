import { Injectable, NotFoundException } from '@nestjs/common';
import { UploadFileMulterDto } from './dto/upload-file-multer.dto';
import { FileRepository } from './repositories/file.repository';
import { In } from 'typeorm';
import type { File } from './entities/file.entity';
import  { FirebaseStorageService } from './firebase-storage-service.service';

@Injectable()
export class FilesService {
   async findOneById(id: Uuid) {
        const file = await this.fileRepository.findOne({
            where: { id },
          });
    return file;
    }


    async findInIds(fileIds: string[]) {
  return await this.fileRepository.find(({ where: { id: In(fileIds) } }))
    }
    async removeFile(file: File) {
return await this.fileRepository.remove(file)
    }
  constructor(
    
    private fileRepository: FileRepository,
    private firebaseStorage:FirebaseStorageService
  ) { }

  async uploadFile(file: UploadFileMulterDto) {
   
    const object = await this.firebaseStorage.uploadFile(file)
    file.filename=object.filename;
    file.public_url=object.public_url
    file.buffer=null;
    return await this.fileRepository.uploadFile({ ...file });
  }

  async uploadAnonymousFile(file: UploadFileMulterDto) {
    return this.fileRepository.uploadFile(file);
  }

  async uploadFiles(files: UploadFileMulterDto[]) {
    const filesPromise = [];
   
    const uploadedFiles=await this.firebaseStorage.uploadFiles(files)
    console.log('uploadedFiles',uploadedFiles);

    for (const file of uploadedFiles) {
        filesPromise.push(
          this.fileRepository.uploadFile({ ...file }),
        );
      }
    const l=await Promise.all(filesPromise);
    console.log(l);
    return l;
  }

  findAllByIds = (images: string[]) =>
    this.fileRepository.find({
      where: {
        id: In(images),
      },
    });

    updateAllByIds = (fileIds: string[], data: any) =>
      this.fileRepository.update(fileIds, data);

    async deleteFile(fileId: string): Promise<void> {
      const file = await this.fileRepository.findOne({
        where: { id: fileId },
      });
  
      if (!file) {
        throw new NotFoundException(`File with id ${fileId} not found`);
      }
  
      try{
        await this.firebaseStorage.deleteFile(file.filename)

      }catch(error:any){
        console.log('File Deletion From Firebase Storage:\n ',error);
      }
      await this.fileRepository.delete(fileId);
    }



    async remove(id: string) {
      return this.fileRepository.delete(id);
    }





}
