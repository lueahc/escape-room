import { Module } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from 'src/record/record.entity';
import { Tag } from 'src/record/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Record, Tag])],
  controllers: [RecordController],
  providers: [RecordService]
})
export class RecordModule { }
