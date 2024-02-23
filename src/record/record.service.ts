import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from './record.entity';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CreateRecordRequestDto } from './dto/createRecord.request.dto';
import { UpdateRecordRequestDto } from './dto/updateRecord.request.dto';
import { ThemeService } from 'src/theme/theme.service';
import { UserService } from 'src/user/user.service';
import { Tag } from './tag.entity';
import { ReviewService } from 'src/review/review.service';
import { GetLogsResponseDto } from './dto/getLogs.response.dto';

@Injectable()
export class RecordService {
    constructor(
        @InjectRepository(Record)
        private readonly recordRepository: Repository<Record>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
        private readonly userService: UserService,
        private readonly themeService: ThemeService,
        @Inject(forwardRef(() => ReviewService))
        private readonly reviewService: ReviewService
    ) { }

    async test() {
        return await this.recordRepository.find({
            relations: {
                reviews: true
            },
        });
    }

    async getRecordById(id: number) {
        return await this.recordRepository.findOne({
            relations: {
                writer: true
            },
            where: {
                id
            }
        });
    }

    async getRecordInfo(id: number) {
        return await this.recordRepository.findOne({
            select: {
                id: true,
                writer: {
                    id: true,
                    nickname: true,
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
                        id: true,
                        nickname: true
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
            relations: {
                writer: true,
                theme: {
                    store: true
                },
                reviews: {
                    writer: true
                }
            },
            where: {
                id
            }
        });
    }

    async getTagsByRecordId(recordId: number) {
        return await this.tagRepository.find({
            select: {
                user: {
                    id: true
                }
            },
            where: {
                record: {
                    id: recordId
                }
            }
        })
    }

    async getOneTag(userId: number, recordId: number) {
        return await this.tagRepository.findOne({
            relations: {
                user: true,
                record: true
            },
            where: {
                user: {
                    id: userId
                },
                record: {
                    id: recordId
                }
            }
        })
    }

    async isUserTagged(userId: number, recordId: number) {
        const tags = await this.getTagsByRecordId(recordId);
        const taggedUsers = tags.map((tag) => tag.user.id);

        return taggedUsers.includes(userId);
    }

    changeVisibility(element) {
        if (element.visibility) element.visibility = false;
        else element.visibility = true;
    }

    async getLogs(userId: number) {
        const rawQuery =
            `select record.id, record.play_date, store.name as store_name, theme.name as theme_name, record.is_success
            from record, store, theme
            where record.theme_id = theme.id and theme.store_id = store.id and record.writer_id = ? and record.visibility = true
            union
            select record.id, record.play_date, store.name as store_name, theme.name as theme_name, record.is_success
            from record, store, theme, tag
            where tag.record_id = record.id and record.theme_id = theme.id and theme.store_id = store.id and tag.user_id = ? and tag.visibility = true`;
        const logs = await this.recordRepository.query(rawQuery, [userId, userId]);

        const mapLogs = logs.map((log) => {
            return new GetLogsResponseDto(log);
        });

        return mapLogs;
    }

    async getRecordAndReviews(recordId: number) {
        const record = await this.getRecordInfo(recordId);
        if (!record) {
            throw new NotFoundException(
                '기록이 존재하지 않습니다.',
                'NON_EXISTING_RECORD'
            )
        }

        return record;
    }

    @Transactional()
    async createRecord(userId: number, createRecordRequestDto: CreateRecordRequestDto) {
        const { themeId, isSuccess, playDate, headCount, hintCount, playTime, image, note, party } = createRecordRequestDto;

        const user = await this.userService.findOneById(userId);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const theme = await this.themeService.getThemeById(themeId);
        if (!theme) {
            throw new NotFoundException(
                '테마가 존재하지 않습니다.',
                'NON_EXISTING_THEME'
            );
        }

        const record = this.recordRepository.create({
            writer: user,
            theme,
            isSuccess,
            playDate,
            headCount,
            hintCount,
            playTime,
            image,
            note
        });
        await this.recordRepository.save(record);

        if (party) {
            if (headCount < party.length) {
                throw new BadRequestException(
                    '일행으로 추가할 사용자 수가 인원 수보다 많습니다.',
                    'PARTY_LENGTH_OVER_HEADCOUNT'
                )
            }

            for (const memberId of party) {
                const member = await this.userService.findOneById(memberId);
                if (!member) {
                    throw new NotFoundException(
                        '일행이 존재하지 않습니다.',
                        'NON_EXISTING_PARTY'
                    );
                }

                const tag = this.tagRepository.create({
                    user: member,
                    record
                });
                await this.tagRepository.save(tag);
            }
        }

        return record;
    }

    async updateRecord(userId: number, recordId: number, updateRecordRequestDto: UpdateRecordRequestDto) {
        const { themeId, isSuccess, playDate, headCount, hintCount, playTime, image, note } = updateRecordRequestDto;

        const record = await this.getRecordById(recordId);
        if (!record) {
            throw new NotFoundException(
                '기록이 존재하지 않습니다.',
                'NON_EXISTING_RECORD'
            )
        }

        const user = await this.userService.findOneById(userId);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const recordWriter = record.writer;
        if (userId !== recordWriter.id) {
            throw new ForbiddenException(
                '기록을 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        const theme = await this.themeService.getThemeById(themeId);
        if (!theme) {
            throw new NotFoundException(
                '테마가 존재하지 않습니다.',
                'NON_EXISTING_THEME'
            );
        }

        record.theme = theme;
        record.isSuccess = isSuccess;
        record.playDate = playDate;
        record.headCount = headCount;
        record.hintCount = hintCount;
        record.playTime = playTime;
        record.image = image;
        record.note = note;
        await this.recordRepository.save(record);

        return record;
    }

    async changeRecordVisibility(userId: number, recordId: number) {
        const record = await this.getRecordById(recordId);
        if (!record) {
            throw new NotFoundException(
                '기록이 존재하지 않습니다.',
                'NON_EXISTING_RECORD'
            )
        }

        const user = await this.userService.findOneById(userId);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const isWriter = userId === record.writer.id;
        const isTagged = await this.isUserTagged(userId, recordId);
        if (!isWriter && !isTagged) {
            throw new ForbiddenException(
                '공개 여부를 변경할 수 있는 사용자가 아닙니다.',
                'USER_FORBIDDEN')
        }

        // 본인
        if (isWriter) {
            this.changeVisibility(record);
            await this.recordRepository.save(record);
        }

        // 일행
        if (isTagged) {
            const tag = await this.getOneTag(userId, recordId);
            if (!tag) {
                throw new InternalServerErrorException(
                    '해당 기록에 태그된 사용자가 아닙니다.',
                    'USER_FORBIDDEN')
            }

            this.changeVisibility(tag);
            await this.tagRepository.save(tag);
        }

        return {}
    }

    async deleteRecord(userId: number, recordId: number) {
        const record = await this.getRecordById(recordId);
        if (!record) {
            throw new NotFoundException(
                '기록이 존재하지 않습니다.',
                'NON_EXISTING_RECORD'
            )
        }

        const user = await this.userService.findOneById(userId);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const recordWriter = record.writer;
        if (userId !== recordWriter.id) {
            throw new ForbiddenException(
                '기록을 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        const hasReviews = await this.reviewService.hasReviews(recordId);
        if (hasReviews) {
            throw new BadRequestException(
                '기록에 리뷰가 존재합니다.',
                'REVIEWS_EXISTING_IN_RECORD'
            )
        } else {
            await this.recordRepository.softDelete({ id: recordId });
        }
    }
}
