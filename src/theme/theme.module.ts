import { Module } from '@nestjs/common';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';
import { Theme } from './domain/theme.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewModule } from 'src/review/review.module';
import { THEME_REPOSITORY } from 'src/common/inject.constant';
import { TypeormThemeRepository } from './infrastructure/typeormTheme.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Theme]),
    ReviewModule
  ],
  controllers: [ThemeController],
  providers: [
    ThemeService,
    { provide: THEME_REPOSITORY, useClass: TypeormThemeRepository },
  ],
  exports: [ThemeService]
})
export class ThemeModule { }
