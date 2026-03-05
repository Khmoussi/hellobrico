import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import type { UploadFileMulterDto } from './dto/upload-file-multer.dto';
import { File } from './entities/file.entity';

@Injectable()
export class FirebaseStorageService {
  private readonly storage: Storage;
  private readonly bucketName: string;
  private readonly logger = new Logger(FirebaseStorageService.name);

  constructor(private configService: ConfigService) {
    this.storage = new Storage({
      projectId: 'hellobrico',
      credentials: {
        "type": "service_account",
        "project_id": "hellobrico",
        "private_key_id": "f41cf55ff03cddc8cb7edeb781c97113f284164a",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCzuMslUrqV0Gue\nkFpZAggAQd/glXIgVcmcj6tT4C75KpTFjVJ/d7SEtfxfumyvDyixCl434GloZgRx\n/FyzRaO4pu+cbf2TzoNGjQ20bSSJOf5y1/p1slLW9UsnSnPb88ChC6jtcQEbAVqV\n/MyW9hFdpAkcHErf5uz4/XxPTZnvmv8C9t1EJRbzwI5LwhABw/VHiJn4gKh8KPEc\n2RTt6uEvGDaZjJnprqYXPcZf7W5Y9e1BjaCxGRW7Foke8ls3p3/bnXPLStyhnIW6\n1/M1o8L4+/Z8lQvkiJ5hGYDkVKlv3nRPvup9n5tNGzT9BczpT/gkkjvLCq9BTnWD\nVNP82qxZAgMBAAECggEAAcR09vp/zD5e+JG52bs74ejD71z44NmHIIuHJ02CmL+y\n89hmcct3EoEJqNVYAUa4YzlTYOBLmRO7wnU1Yivypru5ioPIZR44S0bS1i3mmJTh\n7DY0h9jHmMaTxSCl0AlvIQZQ1HjyhlX2kpgIWQm1dQLKdiTPFbGbLf2sLcl5FJKg\n7EIoqWjKO+ocbvMN53ZlnjbAyJXEsBFnuLc6PRgGUQ+VYv/8hTnjGo71L3GZGJyE\n7s8a3IXZYbFetui8XC/bGUi9Q8QHS7pJv8u/bu+A59szuErlMNuqShM83Z/sGNPI\nESAJiTjXONChrOEJzIbv13nodCxS/f4FN7M+Y8Dy4wKBgQDZcct3UZJMbXRQV6r3\n8t9KlfMNFGO9KQgD2bxs0jRzzEe1Eech5sc6kbWTKasKhhIysu+0VZ45FAPkduFb\nMXFwJbQ6BQHuz1nDI/w1wct8T50uDqr3P/kZBr866geQOogbBcWeLTqDXy7L/Whd\nCvzn5lbCZ6JLDtj3jORouEV4iwKBgQDTlrKt0KGhIkNdgeXmAN8S6qJ16thK6wYA\nFNuIZxPOeBrN9YZHqo/nRfRXmHSe7KmFM3FeThcAlUwTkKaj5ySrXDTfzhzQhlxj\nn5kd5qmq0ED2TxXHrr8gkMJdd7RIxirlikeut+qTy9JlnjbjCFWyiWdks4h/4Dtq\nnEnar37nKwKBgBS0+nxNX1I55ia0goqELXFr4C5xr6HW43WCaagvSGFypa1/m/Ql\nhvlz4Me34xroc5kyYxNYR+4Fku1RyNonVjco0AXqbimww0qLBbyUzOz0o/I74VoU\nVINmmhVhLgE1Ibr5DL2obvcNvGYepq6dmkH3NHHk7paZPl4so5+5VJxLAoGATJp/\noBwrmDneZ8kyoZ3pJWEbZlOa8Sy7pGXowS6IZjTnh29/qQygQtv5xYjll/AYw6fH\nQJxHCagDvgWdvzNc/ElKv0hQ+FHcuxi6B7BN9xCkpEgnm36xpamjJNHEzKAqQaZZ\no3DklZOyXaX1Oyb2V8gVTckN/zYAbO2ec3UcHbcCgYBmKkhq124HAlXYrB8mL+GA\nQJLq5zTiCE6fQZlM72OepC8ZQEqdQy+v5Mg3L8CNkDCOoETW2NMaQE7JJ9cYO3ra\nwnY611hftivzegq6zsfg3U3sibyTz1uIWpfpunqqMK9ZY9zMSAu4BDVkz2s+nYyr\nzHfPV72xFJNqlHdV1mVBHQ==\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-fbsvc@hellobrico.iam.gserviceaccount.com",
        "client_id": "104589827432085022580",
        "universe_domain": "googleapis.com"
      }
    });
    this.bucketName = this.configService.get<string>('FIREBASE_STORAGE_BUCKET')!;
  }

  async uploadFile(file: UploadFileMulterDto): Promise<File> {
    const folder = 'hello-brico';
    const uniqueFilename = uuidv4();
    const extension = path.extname(file.originalname);
  
    const filePath = folder
      ? `${folder}/${uniqueFilename}${extension}`
      : `${uniqueFilename}${extension}`;
  
    const bucket = this.storage.bucket(this.bucketName);
    const fileUpload = bucket.file(filePath);
  
    return new Promise<File>((resolve, reject) => {
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });
  
      stream.on('error', (error) => {
        this.logger.error('Error uploading file to Firebase Storage', error);
        reject(error);
      });
  
      stream.on('finish', async () => {
        await fileUpload.makePublic();
  
        const public_url = `https://storage.googleapis.com/${this.configService.get<string>(
          'FIREBASE_STORAGE_BUCKET_NAME',
        )}/${encodeURIComponent(filePath)}`;
  
        // Build File entity
        const fileEntity = new File();
        fileEntity.filename = filePath;
        fileEntity.mimetype = file.mimetype;
        fileEntity.originalname = file.originalname;
        fileEntity.extension = extension;
        fileEntity.size = file.size;
        fileEntity.public_url = public_url;
        fileEntity.protected_url = `/files/${filePath}/download`;
  
        // If you want to persist in DB:
        // const savedFile = await this.fileRepository.save(fileEntity);
        // resolve(savedFile);
  
        resolve(fileEntity); // return File entity object without saving
      });
  
      stream.end(file.buffer);
    });
  }
  

  async uploadFiles(files: UploadFileMulterDto[]) {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }
  

  async deleteFile(fileName: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);

    return new Promise<void>((resolve, reject) => {
      file.delete((error, _) => {
        if (error) {
          this.logger.error('Error deleting file from Firebase Storage', error);
          reject(error);
        } else {
          this.logger.log(`Successfully deleted file: ${fileName}`);
          resolve();
        }
      });
    });
  }
}
