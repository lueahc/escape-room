import { Module } from '@nestjs/common';
import { UserController } from './presentation/user.controller';
import { UserService } from './application/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/user.entity';
import { AuthModule } from '../auth/auth.module';
import { TypeormUserRepository } from './infrastructure/typeormUser.repository';
import { USER_REPOSITORY } from '../common/inject.constant';

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
