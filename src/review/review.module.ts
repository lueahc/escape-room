import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Record } from './record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Record, Review])],
  controllers: [ReviewController],
  providers: [ReviewService]
})
export class ReviewModule { }
