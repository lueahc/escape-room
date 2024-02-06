import { Module } from '@nestjs/common';
import { ThemeModule } from './theme/theme.module';
import { DatabaseModule } from './config/database.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [DatabaseModule, ThemeModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
