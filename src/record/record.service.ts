import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { Record } from './domain/record.entity';
import { Transactional } from 'typeorm-transactional';
import { CreateRecordRequestDto } from './dto/createRecord.request.dto';
import { UpdateRecordRequestDto } from './dto/updateRecord.request.dto';
import { Tag } from './domain/tag.entity';
import { ReviewService } from 'src/review/review.service';
import { GetLogsResponseDto } from './dto/getLogs.response.dto';
import { RecordPartial } from './record.types';
import { CreateAndUpdateRecordResponseDto } from './dto/createAndUpdateRecord.response.dto';
import { RECORD_REPOSITORY } from 'src/inject.constant';
import { RecordRepository } from './domain/record.repository';
import { ThemeService } from 'src/theme/theme.service';
import { UserService } from 'src/user/user.service';
import { GetOneRecordResponseDto } from './dto/getOneRecord.response.dto';
import { GetRecordReviewsResponseDto } from './dto/getRecordReviews.response.dto';

@Injectable()
export class RecordService {
    constructor(
        @Inject(RECORD_REPOSITORY)
        private readonly recordRepository: RecordRepository,
        private readonly userService: UserService,
        @Inject(forwardRef(() => ThemeService))
        private readonly themeService: ThemeService,
        @Inject(forwardRef(() => ReviewService))
        private readonly reviewService: ReviewService
    ) { }

    async findOneById(id: number) {
        return await this.recordRepository.findOneById(id);
    }

    async getOneTag(userId: number, recordId: number) {
        return await this.recordRepository.getOneTag(userId, recordId);
    }

    private isArrayNotEmpty(arr) {
        return !(arr.length === 1 && arr[0] === '');
    }

    private async mapReviewsToResponseDto(record: Record): Promise<GetOneRecordResponseDto> {
        const reviews = await Promise.all(record.getReviews().map(async (review) => {
            return new GetRecordReviewsResponseDto(review);
        }));
        return new GetOneRecordResponseDto({ record, reviews });
    }

    async getTaggedUsers(userId: number, recordId: number): Promise<string[]> {
        const tags = await this.recordRepository.getTaggedUsers(userId, recordId);
        return tags.map(tag => tag.getUser().getNickname());
    }

    async getLogs(userId: number): Promise<GetLogsResponseDto[]> {
        const logs = await this.recordRepository.getLogs(userId);
        return logs.map(log => new GetLogsResponseDto(log));
    }

    async getRecordAndReviews(recordId: number): Promise<GetOneRecordResponseDto> {
        const record = await this.recordRepository.getRecordInfo(recordId);
        if (!record) {
            throw new NotFoundException(
                '기록이 존재하지 않습니다.',
                'NON_EXISTING_RECORD'
            )
        }

        return await this.mapReviewsToResponseDto(record);
    }

    async getAllRecordsAndReviews(userId: number, visibility: string): Promise<GetOneRecordResponseDto[]> {
        let whereConditions: RecordPartial = {};
        if (visibility === 'true') {
            whereConditions._tags = {
                _visibility: true,
                _user: {
                    _id: userId
                }
            };
        } else if (visibility === 'false') {
            whereConditions._tags = {
                _visibility: false,
                _user: {
                    _id: userId
                }
            };
        } else {
            whereConditions._tags = {
                _user: {
                    _id: userId
                }
            };
        }

        const records = await this.recordRepository.getRecordAndReviews(whereConditions);
        return await Promise.all(records.map(async (record) => {
            return await this.mapReviewsToResponseDto(record);
        }));
    }

    @Transactional()
    async createRecord(userId: number, createRecordRequestDto: CreateRecordRequestDto, file: Express.Multer.File): Promise<CreateAndUpdateRecordResponseDto> {
        const { themeId, isSuccess, playDate, headCount, hintCount, playTime, note, party } = createRecordRequestDto;
        const image = file ? (file as any).location : null;

        const user = await this.userService.findOneById(userId);
        if (!user) {
            throw new NotFoundException(
                '사용자가 존재하지 않습니다.',
                'NON_EXISTING_USER'
            );
        }

        const theme = await this.themeService.findOneById(themeId);
        if (!theme) {
            throw new NotFoundException(
                '테마가 존재하지 않습니다.',
                'NON_EXISTING_THEME'
            );
        }

        const record = await Record.create({ user, theme, isSuccess, playDate, headCount, hintCount, playTime, image, note })
        await this.recordRepository.save(record);

        const tag = await Tag.create({ user, record, isWriter: true });
        await this.recordRepository.saveTag(tag);

        if (party) {
            const uniqueParty = [...new Set(party.filter((element) => element !== userId))];  // 본인 및 중복값 제외
            if (this.isArrayNotEmpty(uniqueParty)) {
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
                            `일행 memberId:${memberId}는 존재하지 않습니다.`,
                            'NON_EXISTING_PARTY'
                        );
                    }

                    const tag = await Tag.create({ user: member, record, isWriter: false });
                    await this.recordRepository.saveTag(tag);
                }
            }
        }

        return new CreateAndUpdateRecordResponseDto(record);
    }

    @Transactional()
    async updateRecord(userId: number, recordId: number, updateRecordRequestDto: UpdateRecordRequestDto, file: Express.Multer.File): Promise<CreateAndUpdateRecordResponseDto> {
        const { isSuccess, playDate, headCount, hintCount, playTime, note, party } = updateRecordRequestDto;
        const image = file ? (file as any).location : null;

        const record = await this.recordRepository.findOneById(recordId);
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

        if (record.isNotWriter(userId)) {
            throw new ForbiddenException(
                '기록을 등록한 사용자가 아닙니다.',
                'USER_WRITER_DISCORDANCE'
            )
        }

        await record.updateRecord({ isSuccess, playDate, headCount, hintCount, playTime, image, note });
        await this.recordRepository.save(record);

        const uniqueParty = [...new Set(party.filter((element) => element !== userId))];
        if (this.isArrayNotEmpty(uniqueParty)) {
            let countParty = (headCount !== undefined && headCount !== null) ? headCount : record.getHeadCount();
            if (countParty <= uniqueParty.length) {
                throw new BadRequestException(
                    '일행으로 추가할 사용자 수가 인원 수보다 많습니다.',
                    'PARTY_LENGTH_OVER_HEADCOUNT'
                )
            }

            const tags = await this.recordRepository.getTaggedUsers(userId, recordId);
            const originalParty = tags.map(tag => tag.getUser().getId());

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
                    const tag = await Tag.create({ user: member, record, isWriter: false });
                    await this.recordRepository.saveTag(tag);
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
                const deleteTag = await this.recordRepository.getOneTag(memberId, recordId);
                if (!deleteTag) {
                    throw new NotFoundException(
                        '삭제할 일행이 존재하지 않습니다.',
                        'NON_EXISTING_USER'
                    );
                }
                await this.recordRepository.softDeleteTag(deleteTag.getId());
            }
        }

        return new CreateAndUpdateRecordResponseDto(record);
    }

    async changeRecordVisibility(userId: number, recordId: number): Promise<void> {
        const record = await this.recordRepository.findOneById(recordId);
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

        const tag = await this.recordRepository.getOneTag(userId, recordId);
        if (!tag) {
            throw new ForbiddenException(
                '해당 기록에 태그된 사용자가 아닙니다.',
                'USER_FORBIDDEN')
        }

        tag.changeVisibility();
        await this.recordRepository.saveTag(tag);
    }

    async deleteRecord(userId: number, recordId: number): Promise<void> {
        const record = await this.recordRepository.findOneById(recordId);
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

        if (record.isNotWriter(userId)) {
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
            await this.recordRepository.softDelete(recordId);
        }
    }
}
