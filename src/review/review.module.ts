import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Record } from './record.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ThemeModule } from 'src/theme/theme.module';
import { Tag } from './tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Record, Review, Tag]),
    AuthModule,
    ThemeModule],
  controllers: [ReviewController],
  providers: [ReviewService]
})
export class ReviewModule { }
