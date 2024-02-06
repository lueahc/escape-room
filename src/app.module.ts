import { Module } from '@nestjs/common';
import { ThemeModule } from './theme/theme.module';
import { DatabaseModule } from './config/database.module';

@Module({
  imports: [DatabaseModule, ThemeModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
