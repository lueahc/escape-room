import { Module, forwardRef } from '@nestjs/common';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';
import { Theme } from './theme.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewModule } from 'src/review/review.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Theme]),
    ReviewModule],
  controllers: [ThemeController],
  providers: [ThemeService],
  exports: [ThemeService]
})
export class ThemeModule { }
