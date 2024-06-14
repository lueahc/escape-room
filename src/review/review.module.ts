import { Module, forwardRef } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { UserModule } from 'src/user/user.module';
import { RecordModule } from 'src/record/record.module';
import { USER_REPOSITORY } from 'src/inject.constant';
import { TypeormUserRepository } from 'src/user/infrastructure/typeormUser.repository';
import { User } from 'src/user/domain/user.entity';

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
  ],
  exports: [ReviewService]
})
export class ReviewModule { }
