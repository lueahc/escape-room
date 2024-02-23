import { Module, forwardRef } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { UserModule } from 'src/user/user.module';
import { RecordModule } from 'src/record/record.module';
import { ThemeModule } from 'src/theme/theme.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    UserModule,
    RecordModule,
    ThemeModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService]
})
export class ReviewModule { }
