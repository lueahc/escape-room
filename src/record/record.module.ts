import { Module, forwardRef } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from 'src/record/domain/record.entity';
import { Tag } from 'src/record/domain/tag.entity';
import { ThemeModule } from 'src/theme/theme.module';
import { UserModule } from 'src/user/user.module';
import { ReviewModule } from 'src/review/review.module';
import { S3StorageModule } from 'src/config/s3Storage.module';
import { RECORD_REPOSITORY, THEME_REPOSITORY, USER_REPOSITORY } from 'src/inject.constant';
import { TypeormRecordRepository } from './infrastructure/typeormRecord.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Record, Tag]),
    UserModule,
    forwardRef(() => ThemeModule),
    forwardRef(() => ReviewModule),
    S3StorageModule
  ],
  controllers: [RecordController],
  providers: [
    RecordService,
    { provide: RECORD_REPOSITORY, useClass: TypeormRecordRepository },
  ],
  exports: [RecordService],
})
export class RecordModule { }
