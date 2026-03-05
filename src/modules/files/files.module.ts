import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeOrmExModule } from '../../database/typeorm-ex.module';
import { FirebaseStorageService } from './firebase-storage-service.service';
import { FilesController } from './files.controller.ts';
import { FilesService } from './files.service.ts';
import { File } from './entities/file.entity.ts';
import { FileRepository } from './repositories/file.repository.ts';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    TypeOrmExModule.forCustomRepository([FileRepository]),
  ],
  controllers: [FilesController],
  providers: [FilesService, FirebaseStorageService],
  exports: [FilesService, FirebaseStorageService],
})
export class FilesModule {}
