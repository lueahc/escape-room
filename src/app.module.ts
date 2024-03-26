import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThemeModule } from './theme/theme.module';
import { DatabaseModule } from './config/database.module';
import { UserModule } from './user/user.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';
import { JwtPassportModule } from './jwt/jwt.passport.module';
import { StoreModule } from './store/store.module';
import { RecordModule } from './record/record.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './logger/logger.middleware';
import { AppController } from './app.controller';
import { SlackModule } from 'nestjs-slack';

@Module({
  imports: [DatabaseModule, ThemeModule, UserModule, ReviewModule, AuthModule, JwtPassportModule, StoreModule, RecordModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SlackModule.forRoot({
      type: 'webhook',
      url: process.env.SLACK_WEBHOOK_URL,
    }),],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
