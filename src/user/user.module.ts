import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SlackModule } from 'nestjs-slack';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    SlackModule.forRoot({
      type: 'webhook',
      url: process.env.SLACK_WEBHOOK_URL,
    }),],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
