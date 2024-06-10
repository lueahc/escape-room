import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThemeModule } from './theme/theme.module';
import { DatabaseModule } from './config/database.module';
import { UserModule } from './user/user.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';
import { JwtPassportModule } from './jwt/jwt.passport.module';
import { StoreModule } from './store/store.module';
import { RecordModule } from './record/record.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { AppController } from './app.controller';
import { SlackModule } from 'nestjs-slack';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './logger/error.filter';
import { AppConfigModule } from './config/appConfig.module';

@Module({
  imports: [AppConfigModule, DatabaseModule,
    AuthModule, JwtPassportModule,
    UserModule, ThemeModule, StoreModule, RecordModule, ReviewModule,
    // ConfigModule.forRoot({
    //   isGlobal: true,
    // }),
    SlackModule.forRoot({
      type: 'webhook',
      url: process.env.SLACK_WEBHOOK_URL,
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
