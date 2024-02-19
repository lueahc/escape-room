import { Module } from '@nestjs/common';
import { ThemeModule } from './theme/theme.module';
import { DatabaseModule } from './config/database.module';
import { UserModule } from './user/user.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';
import { JwtPassportModule } from './jwt/jwt.passport.module';
import { StoreModule } from './store/store.module';
import { RecordModule } from './record/record.module';

@Module({
  imports: [DatabaseModule, ThemeModule, UserModule, ReviewModule, AuthModule, JwtPassportModule, StoreModule, RecordModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
