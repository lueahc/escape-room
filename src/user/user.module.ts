import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TypeormUserRepository } from './infrastructure/typeormUser.repository';
import { USER_REPOSITORY } from 'src/inject.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: USER_REPOSITORY, useClass: TypeormUserRepository },
  ],
  exports: [UserService],
})
export class UserModule { }
