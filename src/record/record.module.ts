import { Module, forwardRef } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './domain/record.entity';
import { Tag } from './domain/tag.entity';
import { ThemeModule } from '../theme/theme.module';
import { UserModule } from '../user/user.module';
import { ReviewModule } from '../review/review.module';
import { S3StorageModule } from './s3Storage.module';
import { RECORD_REPOSITORY } from '../common/inject.constant';
import { TypeormRecordRepository } from './infrastructure/typeormRecord.repository';
import { TagPartyService } from './tagParty.service';

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
    TagPartyService,
    { provide: RECORD_REPOSITORY, useClass: TypeormRecordRepository },
  ],
  exports: [RecordService],
})
export class RecordModule { }
