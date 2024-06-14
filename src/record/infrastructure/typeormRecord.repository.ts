import { Injectable } from "@nestjs/common";
import { Record } from "../domain/record.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { RecordRepository } from "../domain/record.repository";
import { Tag } from "../domain/tag.entity";
import { RecordPartial } from "../record.types";

@Injectable()
export class TypeormRecordRepository implements RecordRepository {
    constructor(
        @InjectRepository(Record)
        private readonly recordRepository: Repository<Record>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
    ) { }

    create(record: Partial<Record>): Record {
        return this.recordRepository.create(record);
    }

    async save(record: Record): Promise<Record> {
        return await this.recordRepository.save(record);
    }

    async softDelete(id: number): Promise<void> {
        await this.recordRepository.softDelete(id);
    }

    createTag(tag: Partial<Tag>): Tag {
        return this.tagRepository.create(tag);
    }

    async saveTag(tag: Tag): Promise<Tag> {
        return await this.tagRepository.save(tag);
    }

    async softDeleteTag(id: number): Promise<void> {
        await this.tagRepository.softDelete(id);
    }

    async getLogs(userId: number) {
        return await this.recordRepository.createQueryBuilder('r')
            .leftJoin('theme', 't', 'r.theme_id = t.id')
            .leftJoin('store', 's', 't.store_id = s.id')
            .leftJoin('tag', 't2', 't2.record_id = r.id')
            .addSelect('r.id', 'id')
            .addSelect('r.playDate', 'play_date')
            .addSelect('s.name', 'store_name')
            .addSelect('t.name', 'theme_name')
            .addSelect('r.isSuccess', 'is_success')
            .where('r.writer__id = :userId and t2.isWriter = true and t2.visibility = true', { userId })
            .orWhere('t2.user__id = :userId and t2.isWriter = false and t2.visibility = true', { userId })
            .orderBy('play_date', 'DESC')
            .getRawMany();
    }

    async findOneById(id: number) {
        return await this.recordRepository.findOne({
            relations: ['writer'],
            where: { id }
        });
    }

    async getRecordInfo(id: number) {
        return await this.recordRepository.findOne({
            select: {
                id: true,
                writer: {
                    _id: true,
                    _nickname: true,
                },
                theme: {
                    id: true,
                    name: true,
                    store: {
                        id: true,
                        name: true
                    }
                },
                playDate: true,
                isSuccess: true,
                headCount: true,
                hintCount: true,
                playTime: true,
                image: true,
                note: true,
                reviews: {
                    id: true,
                    writer: {
                        _id: true,
                        _nickname: true
                    },
                    content: true,
                    rate: true,
                    activity: true,
                    story: true,
                    dramatic: true,
                    volume: true,
                    problem: true,
                    difficulty: true,
                    horror: true,
                    interior: true,
                }
            },
            relations: [
                'writer',
                'theme.store',
                'reviews.writer'
            ],
            where: { id }
        });
    }

    async getOneTag(userId: number, recordId: number) {
        return await this.tagRepository.findOne({
            relations: ['user', 'record'],
            where: {
                user: { _id: userId },
                record: { id: recordId }
            }
        })
    }

    async getTaggedUserIds(recordId: number): Promise<Tag[]> {
        return await this.tagRepository.find({
            select: {
                user: {
                    _id: true
                }
            },
            relations: ['user'],
            where: { record: { id: recordId } }
        })
    }

    async getTaggedNicknames(userId: number, recordId: number): Promise<Tag[]> {
        return await this.tagRepository.find({
            select: {
                user: {
                    _nickname: true,
                }
            },
            relations: ['user'],
            where: {
                user: { _id: Not(userId) },
                record: { id: recordId }
            }
        })
    }

    async getRecordAndReviews(whereConditions: RecordPartial): Promise<Record[]> {
        return await this.recordRepository.find({
            select: {
                id: true,
                writer: {
                    _id: true,
                    _nickname: true,
                },
                theme: {
                    id: true,
                    name: true,
                    store: {
                        id: true,
                        name: true
                    }
                },
                playDate: true,
                isSuccess: true,
                headCount: true,
                hintCount: true,
                playTime: true,
                image: true,
                note: true,
                reviews: {
                    id: true,
                    writer: {
                        _id: true,
                        _nickname: true
                    },
                    content: true,
                    rate: true,
                    activity: true,
                    story: true,
                    dramatic: true,
                    volume: true,
                    problem: true,
                    difficulty: true,
                    horror: true,
                    interior: true,
                }
            },
            relations: [
                'writer',
                'theme.store',
                'reviews.writer'
            ],
            where: whereConditions,
            order: { id: 'DESC' }
        });
    }
}