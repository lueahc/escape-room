import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './store.entity';
import { ReviewModule } from '../review/review.module';
import { ThemeModule } from '../theme/theme.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store]),
    ReviewModule,
    ThemeModule],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule { }
