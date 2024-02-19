import { Module } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from 'src/record/record.entity';
import { Tag } from 'src/record/tag.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ThemeModule } from 'src/theme/theme.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Record, Tag]),
    ThemeModule],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule { }
