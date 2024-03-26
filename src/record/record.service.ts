import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from './record.entity';
import { Not, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CreateRecordRequestDto } from './dto/createRecord.request.dto';
import { UpdateRecordRequestDto } from './dto/updateRecord.request.dto';
import { ThemeService } from 'src/theme/theme.service';
import { UserService } from 'src/user/user.service';
import { Tag } from './tag.entity';
import { ReviewService } from 'src/review/review.service';
import { GetLogsResponseDto } from './dto/getLogs.response.dto';
import { RecordPartial } from './record.types';
import { CreateAndUpdateRecordResponseDto } from './dto/createAndUpdateRecord.response.dto';

@Injectable()
export class RecordService {
    constructor(
        @InjectRepository(Record)
        private readonly recordRepository: Repository<Record>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
        private readonly userService: UserService,
        @Inject(forwardRef(() => ThemeService))
        private readonly themeService: ThemeService,
        @Inject(forwardRef(() => ReviewService))
        private readonly reviewService: ReviewService
    ) { }

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
        const result = await this.recordRepository.findOne({
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

        return result;
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

    async getTaggedUsersByRecordId(recordId: number): Promise<number[]> {
        const tags = await this.tagRepository.find({
            select: {
                user: {
                    id: true
                }
            },
            relations: {
                user: true,
            },
            where: {
                record: {
                    id: recordId
                }
            }
        })

        if (!tags) {
            return [];
        }

        return tags.map((tag) => {
            return tag.user.id;
        });
    }

    async getTaggedNicknamesByRecordId(userId: number, recordId: number): Promise<string[]> {
        const tags = await this.tagRepository.find({
            select: {
                user: {
                    nickname: true,
                }
            },
            relations: {
                user: true,
            },
            where: {
                user: {
                    id: Not(userId)
                },
                record: {
                    id: recordId
                }
            }
        })

        if (!tags) {
            return [];
        }

        return tags.map((tag) => {
            return tag.user.nickname;
        });
    }

    changeVisibility(element: Tag): void {
        if (element.visibility) element.visibility = false;
        else element.visibility = true;
    }

    async getLogs(userId: number): Promise<GetLogsResponseDto[]> {
        const logs = await this.recordRepository.createQueryBuilder('r')
            .leftJoin('theme', 't', 'r.theme_id = t.id')
            .leftJoin('store', 's', 't.store_id = s.id')
            .leftJoin('tag', 't2', 't2.record_id = r.id')
            .addSelect('r.id', 'id')
            .addSelect('r.playDate', 'play_date')
            .addSelect('s.name', 'store_name')
            .addSelect('t.name', 'theme_name')
            .addSelect('r.isSuccess', 'is_success')
            .where('r.writer_id = :userId and t2.isWriter = true and t2.visibility = true', { userId })
            .orWhere('t2.user_id = :userId and t2.isWriter = false and t2.visibility = true', { userId })
            .orderBy('play_date', 'DESC')
            .getRawMany();

        if (!logs) {
            return [];
        }

        const mapLogs = logs.map((log) => {
            return new GetLogsResponseDto(log);
        });

        return mapLogs;
    }

    async getRecordAndReviews(recordId: number): Promise<Record> {
        const record = await this.getRecordInfo(recordId);
        if (!record) {
            throw new NotFoundException(
                '기록이 존재하지 않습니다.',
                'NON_EXISTING_RECORD'
            )
        }

        return record;
    }

    async getAllRecordsAndReviews(userId: number, visibility: string) {
        let whereConditions: RecordPartial = {};

        if (visibility === 'true') {
            whereConditions.tags = {
                visibility: true,
                user: {
                    id: userId
                }
            };
        } else if (visibility === 'false') {
            whereConditions.tags = {
                visibility: false,
                user: {
                    id: userId
                }
            };
        } else {
            whereConditions.tags = {
                user: {
                    id: userId
                }
            };
        }

        const result = await this.recordRepository.find({
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
            where: whereConditions,
            order: {
                id: 'DESC'
            }
        });

        if (!result) {
            return [];
        }

        return result;
    }

    @Transactional()
    async createRecord(userId: number, createRecordRequestDto: CreateRecordRequestDto, file: Express.Multer.File): Promise<CreateAndUpdateRecordResponseDto> {
        const { themeId, isSuccess, playDate, headCount, hintCount, playTime, note, party } = createRecordRequestDto;
        const s3File = file as any;

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
            image: s3File.location,
            note
        });
        await this.recordRepository.save(record);

        const tag = this.tagRepository.create({
            user,
            record,
            isWriter: true
        });
        await this.tagRepository.save(tag);

        if (party) {
            // 본인 제외
            let filteredParty = party.filter((element) => element !== userId);
            // 중복값 제외
            let uniqueParty = [...new Set(filteredParty)];
            if (uniqueParty) {
                if (headCount <= uniqueParty.length) {
                    throw new BadRequestException(
                        '일행으로 추가할 사용자 수가 인원 수보다 많습니다.',
                        'PARTY_LENGTH_OVER_HEADCOUNT'
                    )
                }

                for (const memberId of uniqueParty) {
                    const member = await this.userService.findOneById(memberId);
                    if (!member) {
                        throw new NotFoundException(
                            '일행이 존재하지 않습니다.',
                            'NON_EXISTING_PARTY'
                        );
                    }

                    const tag = this.tagRepository.create({
                        user: member,
                        record,
                        isWriter: false
                    });
                    await this.tagRepository.save(tag);
                }
            }
        }

        return new CreateAndUpdateRecordResponseDto(record);
    }

    @Transactional()
    async updateRecord(userId: number, recordId: number, updateRecordRequestDto: UpdateRecordRequestDto, file: Express.Multer.File): Promise<CreateAndUpdateRecordResponseDto> {
        const { isSuccess, playDate, headCount, hintCount, playTime, note, party } = updateRecordRequestDto;
        const s3File = file as any;

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

        record.isSuccess = isSuccess;
        record.playDate = playDate;
        record.headCount = headCount;
        record.hintCount = hintCount;
        record.playTime = playTime;
        record.image = s3File.location;
        record.note = note;
        await this.recordRepository.save(record);

        let filteredParty = party.filter((element) => element !== userId);
        let uniqueParty = [...new Set(filteredParty)];
        if (uniqueParty) {
            let countParty = (headCount !== undefined && headCount !== null) ? headCount : record.headCount;
            if (countParty <= uniqueParty.length) {
                throw new BadRequestException(
                    '일행으로 추가할 사용자 수가 인원 수보다 많습니다.',
                    'PARTY_LENGTH_OVER_HEADCOUNT'
                )
            }

            const result = await this.getTaggedUsersByRecordId(recordId);
            let originalParty = result.filter((element) => element !== userId);

            // 일행 추가
            for (const memberId of uniqueParty) {
                const member = await this.userService.findOneById(memberId);
                if (!member) {
                    throw new NotFoundException(
                        `일행 memberId:${memberId}는 존재하지 않습니다.`,
                        'NON_EXISTING_PARTY'
                    );
                }

                if (!originalParty.includes(memberId)) {
                    const tag = this.tagRepository.create({
                        user: member,
                        record,
                        isWriter: false
                    });
                    await this.tagRepository.save(tag);
                }
            }

            let filteredParty;
            for (const memberId of uniqueParty) {
                filteredParty = originalParty.filter((element) => element !== memberId);
            }

            // 일행 삭제
            for (const memberId of filteredParty) {
                // 작성 리뷰 있는 경우
                const hasWrittenReview = await this.reviewService.hasWrittenReview(memberId, recordId);
                if (hasWrittenReview) {
                    throw new NotFoundException(
                        `일행 memberId:${memberId}는 이미 작성한 리뷰가 있습니다.`,
                        'EXISTING_REVIEW'
                    );
                }

                // 작성 리뷰 없는 경우 일행 삭제
                const deleteTag = await this.getOneTag(memberId, recordId);
                if (!deleteTag) {
                    throw new NotFoundException(
                        '삭제할 일행이 존재하지 않습니다.',
                        'NON_EXISTING_USER'
                    );
                }
                await this.tagRepository.softDelete({ id: deleteTag.id });
            }
        }

        return new CreateAndUpdateRecordResponseDto(record);
    }

    async changeRecordVisibility(userId: number, recordId: number): Promise<void> {
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

        const tag = await this.getOneTag(userId, recordId);
        if (!tag) {
            throw new ForbiddenException(
                '해당 기록에 태그된 사용자가 아닙니다.',
                'USER_FORBIDDEN')
        }

        this.changeVisibility(tag);
        await this.tagRepository.save(tag);
    }

    async deleteRecord(userId: number, recordId: number): Promise<void> {
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
