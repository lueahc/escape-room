import { Module } from '@nestjs/common';
import { ThemeModule } from './theme/theme.module';
import { DatabaseModule } from './config/database.module';
import { UserModule } from './user/user.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';
import { JwtPassportModule } from './jwt/jwt.passport.module';
import { StoreModule } from './store/store.module';
import { RecordModule } from './record/record.module';
import { AppController } from './app.controller';
import { AppConfigModule } from './config/appConfig.module';
import { SlackAlarmModule } from './config/slack.error.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    JwtPassportModule,
    UserModule, ThemeModule, StoreModule, RecordModule, ReviewModule,
    SlackAlarmModule
  ],
  controllers: [AppController],
})
export class AppModule { }
