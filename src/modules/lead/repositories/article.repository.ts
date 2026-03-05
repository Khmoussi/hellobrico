import { Repository } from 'typeorm';
import { CustomRepository } from '../../../database/typeorm-ex.decorator';
import { ArticleEntity } from '../entities/article.entity';

@CustomRepository(ArticleEntity)
export class ArticleRepository extends Repository<ArticleEntity> {

    
}
