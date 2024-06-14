import { Module, forwardRef } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from 'src/record/record.entity';
import { Tag } from 'src/record/tag.entity';
import { ThemeModule } from 'src/theme/theme.module';
import { UserModule } from 'src/user/user.module';
import { ReviewModule } from 'src/review/review.module';
import { S3StorageModule } from 'src/config/s3Storage.module';
import { USER_REPOSITORY } from 'src/inject.constant';
import { TypeormUserRepository } from 'src/user/infrastructure/typeormUser.repository';
import { User } from 'src/user/domain/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Record, Tag, User]),
    UserModule,
    forwardRef(() => ThemeModule),
    forwardRef(() => ReviewModule),
    S3StorageModule
  ],
  controllers: [RecordController],
  providers: [RecordService,
    { provide: USER_REPOSITORY, useClass: TypeormUserRepository },
  ],
  exports: [RecordService],
})
export class RecordModule { }
