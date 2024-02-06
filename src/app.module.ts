import { Module } from '@nestjs/common';
import { ThemeModule } from './theme/theme.module';
import { DatabaseModule } from './config/database.module';
import { UserModule } from './user/user.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [DatabaseModule, ThemeModule, UserModule, ReviewModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
