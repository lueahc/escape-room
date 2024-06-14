import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './domain/review.entity';
import { UserModule } from 'src/user/user.module';
import { RecordModule } from 'src/record/record.module';
import { REVIEW_REPOSITORY } from 'src/inject.constant';
import { TypeormReviewRepository } from './infrastructure/typeormReview.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    UserModule,
    RecordModule
  ],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    { provide: REVIEW_REPOSITORY, useClass: TypeormReviewRepository },
  ],
  exports: [ReviewService]
})
export class ReviewModule { }
