import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { CustomRepository } from '../../../database/typeorm-ex.decorator';

@CustomRepository(File)
export class FileRepository extends Repository<File> {
    async uploadFile(fileBody: Partial<File>): Promise<File> {
        const createdFile = new File();
        Object.assign(createdFile, fileBody);
        return this.save(createdFile);
    
    }

    async getFile(filename: string, userId: string): Promise<File | null> {
        return this.createQueryBuilder('file')
          .addSelect(['file.destination'])
          .where('file.filename = :filename', { filename })
          .andWhere('file.userId = :userId', { userId })
          .getOne();
      }
      
      
}
