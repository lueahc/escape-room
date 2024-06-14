import { Module } from '@nestjs/common';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';
import { Theme } from './domain/theme.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewModule } from 'src/review/review.module';
import { REVIEW_REPOSITORY, THEME_REPOSITORY } from 'src/inject.constant';
import { TypeormThemeRepository } from './infrastructure/typeormTheme.repository';
import { Review } from 'src/review/domain/review.entity';
import { TypeormReviewRepository } from 'src/review/infrastructure/typeormReview.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Theme, Review]),
    ReviewModule
  ],
  controllers: [ThemeController],
  providers: [
    ThemeService,
    { provide: THEME_REPOSITORY, useClass: TypeormThemeRepository },
    { provide: REVIEW_REPOSITORY, useClass: TypeormReviewRepository },
  ],
  exports: [ThemeService]
})
export class ThemeModule { }
