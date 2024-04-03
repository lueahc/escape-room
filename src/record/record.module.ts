import { Module, forwardRef } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from '../record/record.entity';
import { Tag } from '../record/tag.entity';
import { ThemeModule } from '../theme/theme.module';
import { UserModule } from '../user/user.module';
import { ReviewModule } from '../review/review.module';
import { S3StorageModule } from '../config/s3Storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Record, Tag]),
    UserModule,
    forwardRef(() => ThemeModule),
    forwardRef(() => ReviewModule),
    S3StorageModule],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule { }
