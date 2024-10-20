import { Injectable } from '@nestjs/common';
import { Record } from '../domain/record.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { RecordRepository } from '../domain/record.repository';
import { Tag } from '../domain/tag.entity';

@Injectable()
export class TypeormRecordRepository implements RecordRepository {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  create(record: Partial<Record>): Record {
    return this.recordRepository.create(record);
  }

  async save(record: Record): Promise<Record> {
    return await this.recordRepository.save(record);
  }

  async softDelete(id: number): Promise<void> {
    await this.recordRepository.softDelete(id);
  }

  async saveTag(tag: Tag): Promise<Tag> {
    return await this.tagRepository.save(tag);
  }

  async softDeleteTag(id: number): Promise<void> {
    await this.tagRepository.softDelete(id);
  }

  async findOneById(id: number): Promise<Record | null> {
    return await this.recordRepository.findOne({
      relations: ['_writer', '_theme._store'],
      where: { _id: id },
    });
  }

  async getOneTag(userId: number, recordId: number): Promise<Tag | null> {
    return await this.tagRepository.findOne({
      relations: ['_user', '_record'],
      where: {
        _user: { _id: userId },
        _record: { _id: recordId },
      },
    });
  }

  async getTaggedUsers(userId: number, recordId: number): Promise<Tag[]> {
    return await this.tagRepository.find({
      select: { _user: { _id: true, _nickname: true } },
      relations: ['_user'],
      where: {
        _user: { _id: Not(userId) },
        _record: { _id: recordId },
      },
    });
  }

  async getRecordInfo(id: number): Promise<Record | null> {
    return await this.recordRepository.findOne({
      relations: ['_writer', '_theme._store', '_reviews._writer'],
      where: { _id: id },
    });
  }

  async findVisibleRecords(userId: number): Promise<Record[]> {
    return await this.recordRepository.find({
      relations: ['_writer', '_theme._store', '_reviews._writer', '_tags'],
      where: {
        _tags: {
          _visibility: true,
          _user: { _id: userId },
        },
      },
      order: { _id: 'DESC' },
    });
  }

  async findHiddenRecords(userId: number): Promise<Record[]> {
    return await this.recordRepository.find({
      relations: ['_writer', '_theme._store', '_reviews._writer', '_tags'],
      where: {
        _tags: {
          _visibility: false,
          _user: { _id: userId },
        },
      },
      order: { _id: 'DESC' },
    });
  }

  async findAllRecords(userId: number): Promise<Record[]> {
    return await this.recordRepository.find({
      relations: ['_writer', '_theme._store', '_reviews._writer', '_tags'],
      where: {
        _tags: {
          _user: { _id: userId },
        },
      },
      order: { _id: 'DESC' },
    });
  }

  async getLogs(userId: number): Promise<Record[]> {
    return await this.recordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record._theme', 'theme')
      .leftJoinAndSelect('theme._store', 'store')
      .leftJoinAndSelect('record._tags', 'tag')
      .where(
        'record.writer_id = :userId and tag.is_writer = true and tag._visibility = true',
        { userId },
      )
      .orWhere(
        'tag.user_id = :userId and tag.is_writer = false and tag._visibility = true',
        { userId },
      )
      .orderBy('record.play_date', 'DESC')
      .getMany();
  }
}
