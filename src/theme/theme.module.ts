import { Module } from '@nestjs/common';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';
import { Theme } from './theme.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Theme, Store])],
  controllers: [ThemeController],
  providers: [ThemeService],
  exports: [ThemeService]
})
export class ThemeModule { }
