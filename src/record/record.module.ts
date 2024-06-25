import { Module, forwardRef } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from 'src/record/domain/record.entity';
import { Tag } from 'src/record/domain/tag.entity';
import { ThemeModule } from 'src/theme/theme.module';
import { UserModule } from 'src/user/user.module';
import { ReviewModule } from 'src/review/review.module';
import { S3StorageModule } from './s3Storage.module';
import { RECORD_REPOSITORY } from 'src/common/inject.constant';
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
