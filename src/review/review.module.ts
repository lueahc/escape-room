import { Module, forwardRef } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './domain/review.entity';
import { UserModule } from 'src/user/user.module';
import { RecordModule } from 'src/record/record.module';
import { REVIEW_REPOSITORY, USER_REPOSITORY } from 'src/inject.constant';
import { TypeormUserRepository } from 'src/user/infrastructure/typeormUser.repository';
import { User } from 'src/user/domain/user.entity';
import { TypeormReviewRepository } from './infrastructure/typeormReview.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, User]),
    UserModule,
    RecordModule
  ],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    { provide: USER_REPOSITORY, useClass: TypeormUserRepository },
    { provide: REVIEW_REPOSITORY, useClass: TypeormReviewRepository },
  ],
  exports: [ReviewService]
})
export class ReviewModule { }
