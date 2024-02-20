import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { UserModule } from 'src/user/user.module';
import { RecordModule } from 'src/record/record.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review]),
    UserModule,
    RecordModule],
  controllers: [ReviewController],
  providers: [ReviewService]
})
export class ReviewModule { }
