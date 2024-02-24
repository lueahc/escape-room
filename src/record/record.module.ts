import { Module, forwardRef } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from 'src/record/record.entity';
import { Tag } from 'src/record/tag.entity';
import { ThemeModule } from 'src/theme/theme.module';
import { UserModule } from 'src/user/user.module';
import { ReviewModule } from 'src/review/review.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Record, Tag]),
    UserModule,
    forwardRef(() => ThemeModule),
    forwardRef(() => ReviewModule)],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule { }
